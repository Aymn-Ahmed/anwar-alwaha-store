using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Admin;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/error-logs")]
[Authorize]
public class AdminErrorLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminErrorLogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ErrorLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetErrorLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? resolved = null,
        CancellationToken ct = default)
    {
        var query = _context.ErrorLogs.AsNoTracking().AsQueryable();

        if (resolved.HasValue)
        {
            query = query.Where(e => e.IsResolved == resolved.Value);
        }

        int totalCount = await query.CountAsync(ct);
        int safePage = Math.Max(1, page);
        int safePageSize = Math.Clamp(pageSize, 1, 100);

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Select(e => new ErrorLogDto
            {
                Id = e.Id,
                Message = e.Message,
                ExceptionType = e.ExceptionType,
                StackTrace = e.StackTrace,
                Path = e.Path,
                Method = e.Method,
                QueryString = e.QueryString,
                StatusCode = e.StatusCode,
                UserAgent = e.UserAgent,
                ClientIp = e.ClientIp,
                IsResolved = e.IsResolved,
                ResolvedAt = e.ResolvedAt,
                ResolvedBy = e.ResolvedBy,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<PagedResult<ErrorLogDto>>.Ok(new PagedResult<ErrorLogDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = safePage,
            PageSize = safePageSize
        }));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ErrorLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetErrorLogById(Guid id, CancellationToken ct = default)
    {
        var log = await _context.ErrorLogs.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, ct);
        if (log == null)
            return NotFound(ApiResponse<object>.Fail("سجل الخطأ غير موجود."));

        return Ok(ApiResponse<ErrorLogDto>.Ok(new ErrorLogDto
        {
            Id = log.Id,
            Message = log.Message,
            ExceptionType = log.ExceptionType,
            StackTrace = log.StackTrace,
            Path = log.Path,
            Method = log.Method,
            QueryString = log.QueryString,
            StatusCode = log.StatusCode,
            UserAgent = log.UserAgent,
            ClientIp = log.ClientIp,
            IsResolved = log.IsResolved,
            ResolvedAt = log.ResolvedAt,
            ResolvedBy = log.ResolvedBy,
            CreatedAt = log.CreatedAt
        }));
    }

    [HttpPut("{id:guid}/resolve")]
    [ProducesResponseType(typeof(ApiResponse<ErrorLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveErrorLog(Guid id, [FromBody] ResolveErrorLogDto? dto, CancellationToken ct = default)
    {
        var log = await _context.ErrorLogs.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (log == null)
            return NotFound(ApiResponse<object>.Fail("سجل الخطأ غير موجود."));

        log.IsResolved = true;
        log.ResolvedAt = DateTime.UtcNow;
        log.ResolvedBy = dto?.ResolvedBy?.Trim() ?? User.Identity?.Name ?? "Admin";

        await _context.SaveChangesAsync(ct);

        return Ok(ApiResponse<ErrorLogDto>.Ok(new ErrorLogDto
        {
            Id = log.Id,
            Message = log.Message,
            ExceptionType = log.ExceptionType,
            StackTrace = log.StackTrace,
            Path = log.Path,
            Method = log.Method,
            QueryString = log.QueryString,
            StatusCode = log.StatusCode,
            UserAgent = log.UserAgent,
            ClientIp = log.ClientIp,
            IsResolved = log.IsResolved,
            ResolvedAt = log.ResolvedAt,
            ResolvedBy = log.ResolvedBy,
            CreatedAt = log.CreatedAt
        }, "تم تحديد الخطأ كـ تم الحل بنجاح."));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteErrorLog(Guid id, CancellationToken ct = default)
    {
        var log = await _context.ErrorLogs.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (log == null)
            return NotFound(ApiResponse<object>.Fail("سجل الخطأ غير موجود."));

        _context.ErrorLogs.Remove(log);
        await _context.SaveChangesAsync(ct);

        return Ok(ApiResponse<object>.Ok(null, "تم حذف سجل الخطأ بنجاح."));
    }

    [HttpDelete("clear-resolved")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearResolvedErrorLogs(CancellationToken ct = default)
    {
        int deleted = await _context.ErrorLogs
            .Where(e => e.IsResolved)
            .ExecuteDeleteAsync(ct);

        return Ok(ApiResponse<object>.Ok(new { deletedCount = deleted }, $"تم مسح {deleted} سجل خطأ تم حلها."));
    }
}
