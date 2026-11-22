using System.Net;
using System.Text.Json;
using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Entities;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Middlewares;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(IServiceScopeFactory scopeFactory, ILogger<GlobalExceptionHandler> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled server error captured by GlobalExceptionHandler: {Message}", exception.Message);

        // Only log 500 server-side exceptions (skip 4xx client errors)
        bool isClientError = exception is KeyNotFoundException or
                                        ArgumentException or
                                        InvalidOperationException or
                                        UnauthorizedAccessException;

        int statusCode = exception switch
        {
            KeyNotFoundException => StatusCodes.Status404NotFound,
            ArgumentException or InvalidOperationException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        if (!isClientError)
        {
            await LogServerErrorToDatabaseAsync(httpContext, exception, cancellationToken);
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        var responseMessage = isClientError 
            ? exception.Message 
            : "حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً.";

        var response = ApiResponse<string>.Fail(
            responseMessage,
            !isClientError ? new List<string> { exception.Message } : null
        );

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await httpContext.Response.WriteAsync(json, cancellationToken);
        return true;
    }

    private async Task LogServerErrorToDatabaseAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        try
        {
            // Use independent service scope as requested
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Truncate StackTrace to 4000 characters maximum as requested
            var stackTrace = exception.StackTrace;
            if (!string.IsNullOrEmpty(stackTrace) && stackTrace.Length > 4000)
            {
                stackTrace = stackTrace.Substring(0, 4000);
            }

            var path = httpContext.Request.Path.Value ?? string.Empty;
            if (path.Length > 500) path = path.Substring(0, 500);

            var errorLog = new ErrorLog
            {
                Id = Guid.NewGuid(),
                Message = exception.Message.Length > 2000 ? exception.Message.Substring(0, 2000) : exception.Message,
                ExceptionType = exception.GetType().Name,
                StackTrace = stackTrace,
                Path = path,
                Method = httpContext.Request.Method,
                QueryString = httpContext.Request.QueryString.Value,
                StatusCode = 500,
                UserAgent = httpContext.Request.Headers.UserAgent.ToString(),
                ClientIp = httpContext.Connection.RemoteIpAddress?.ToString(),
                IsResolved = false,
                CreatedAt = DateTime.UtcNow
            };

            await db.ErrorLogs.AddAsync(errorLog, cancellationToken);

            // Automatically purge logs older than 14 days to preserve database performance
            var purgeCutoff = DateTime.UtcNow.AddDays(-14);
            await db.ErrorLogs
                .Where(e => e.CreatedAt < purgeCutoff)
                .ExecuteDeleteAsync(cancellationToken);

            await db.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to persist server error to ErrorLogs table: {Message}", ex.Message);
        }
    }
}
