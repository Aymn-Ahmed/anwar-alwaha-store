using System.Net;
using System.Text.Json;
using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public GlobalExceptionMiddleware(
        RequestDelegate next, 
        ILogger<GlobalExceptionMiddleware> logger,
        IServiceScopeFactory scopeFactory)
    {
        _next = next;
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception caught in GlobalExceptionMiddleware: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException => (HttpStatusCode.NotFound, exception.Message),
            ArgumentException or InvalidOperationException => (HttpStatusCode.BadRequest, exception.Message),
            UnauthorizedAccessException => (HttpStatusCode.Forbidden, exception.Message),
            _ => (HttpStatusCode.InternalServerError, "حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً.")
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            await LogServerErrorAsync(context, exception);
        }

        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<string>.Fail(
            message,
            statusCode == HttpStatusCode.InternalServerError ? new List<string> { exception.Message } : null
        );

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }

    private async Task LogServerErrorAsync(HttpContext context, Exception exception)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var stackTrace = exception.StackTrace;
            if (!string.IsNullOrEmpty(stackTrace) && stackTrace.Length > 4000)
            {
                stackTrace = stackTrace.Substring(0, 4000);
            }

            var path = context.Request.Path.Value ?? string.Empty;
            if (path.Length > 500) path = path.Substring(0, 500);

            var errorLog = new ErrorLog
            {
                Id = Guid.NewGuid(),
                Message = exception.Message.Length > 2000 ? exception.Message.Substring(0, 2000) : exception.Message,
                ExceptionType = exception.GetType().Name,
                StackTrace = stackTrace,
                Path = path,
                Method = context.Request.Method,
                QueryString = context.Request.QueryString.Value,
                StatusCode = 500,
                UserAgent = context.Request.Headers.UserAgent.ToString(),
                ClientIp = context.Connection.RemoteIpAddress?.ToString(),
                IsResolved = false,
                CreatedAt = DateTime.UtcNow
            };

            await db.ErrorLogs.AddAsync(errorLog);

            var cutoff = DateTime.UtcNow.AddDays(-14);
            await db.ErrorLogs.Where(e => e.CreatedAt < cutoff).ExecuteDeleteAsync();
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log error to ErrorLogs table: {Message}", ex.Message);
        }
    }
}
