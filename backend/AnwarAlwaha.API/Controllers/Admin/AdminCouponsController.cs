using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Coupons;
using AnwarAlwaha.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/coupons")]
[Authorize]
public class AdminCouponsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminCouponsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<CouponDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCoupons(CancellationToken ct = default)
    {
        var coupons = await _context.Coupons
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                DiscountType = c.DiscountType,
                Value = c.Value,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                ExpiryDate = c.ExpiryDate,
                UsageLimit = c.UsageLimit,
                TimesUsed = c.TimesUsed,
                IsActive = c.IsActive,
                Description = c.Description,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<List<CouponDto>>.Ok(coupons));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CouponDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest(ApiResponse<object>.Fail("رمز الكوبون مطلوب."));

        var normalizedCode = dto.Code.Trim().ToUpperInvariant();
        bool exists = await _context.Coupons.AnyAsync(c => c.Code == normalizedCode, ct);
        if (exists)
            return BadRequest(ApiResponse<object>.Fail("رمز الكوبون مستخدم مسبقاً."));

        var coupon = new Coupon
        {
            Id = Guid.NewGuid(),
            Code = normalizedCode,
            DiscountType = dto.DiscountType.Trim().ToLower() == "fixed" ? "fixed" : "percentage",
            Value = Math.Max(0, dto.Value),
            MinOrderAmount = Math.Max(0, dto.MinOrderAmount),
            MaxDiscountAmount = dto.MaxDiscountAmount.HasValue ? Math.Max(0, dto.MaxDiscountAmount.Value) : null,
            ExpiryDate = dto.ExpiryDate,
            UsageLimit = dto.UsageLimit.HasValue ? Math.Max(1, dto.UsageLimit.Value) : null,
            IsActive = dto.IsActive,
            Description = dto.Description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _context.Coupons.AddAsync(coupon, ct);
        await _context.SaveChangesAsync(ct);

        return StatusCode(StatusCodes.Status201Created, ApiResponse<CouponDto>.Ok(new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            Value = coupon.Value,
            MinOrderAmount = coupon.MinOrderAmount,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            ExpiryDate = coupon.ExpiryDate,
            UsageLimit = coupon.UsageLimit,
            TimesUsed = coupon.TimesUsed,
            IsActive = coupon.IsActive,
            Description = coupon.Description,
            CreatedAt = coupon.CreatedAt
        }, "تم إنشاء الكوبون بنجاح."));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CouponDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] UpdateCouponDto dto, CancellationToken ct = default)
    {
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coupon == null)
            return NotFound(ApiResponse<object>.Fail("الكوبون غير موجود."));

        var normalizedCode = dto.Code.Trim().ToUpperInvariant();
        bool exists = await _context.Coupons.AnyAsync(c => c.Code == normalizedCode && c.Id != id, ct);
        if (exists)
            return BadRequest(ApiResponse<object>.Fail("رمز الكوبون مستخدم لكوبون آخر."));

        coupon.Code = normalizedCode;
        coupon.DiscountType = dto.DiscountType.Trim().ToLower() == "fixed" ? "fixed" : "percentage";
        coupon.Value = Math.Max(0, dto.Value);
        coupon.MinOrderAmount = Math.Max(0, dto.MinOrderAmount);
        coupon.MaxDiscountAmount = dto.MaxDiscountAmount.HasValue ? Math.Max(0, dto.MaxDiscountAmount.Value) : null;
        coupon.ExpiryDate = dto.ExpiryDate;
        coupon.UsageLimit = dto.UsageLimit.HasValue ? Math.Max(1, dto.UsageLimit.Value) : null;
        coupon.IsActive = dto.IsActive;
        coupon.Description = dto.Description?.Trim();
        coupon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return Ok(ApiResponse<CouponDto>.Ok(new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            Value = coupon.Value,
            MinOrderAmount = coupon.MinOrderAmount,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            ExpiryDate = coupon.ExpiryDate,
            UsageLimit = coupon.UsageLimit,
            TimesUsed = coupon.TimesUsed,
            IsActive = coupon.IsActive,
            Description = coupon.Description,
            CreatedAt = coupon.CreatedAt
        }, "تم تحديث الكوبون بنجاح."));
    }

    [HttpPut("{id:guid}/toggle-active")]
    [ProducesResponseType(typeof(ApiResponse<CouponDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleActive(Guid id, CancellationToken ct = default)
    {
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coupon == null)
            return NotFound(ApiResponse<object>.Fail("الكوبون غير موجود."));

        coupon.IsActive = !coupon.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return Ok(ApiResponse<CouponDto>.Ok(new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            Value = coupon.Value,
            MinOrderAmount = coupon.MinOrderAmount,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            ExpiryDate = coupon.ExpiryDate,
            UsageLimit = coupon.UsageLimit,
            TimesUsed = coupon.TimesUsed,
            IsActive = coupon.IsActive,
            Description = coupon.Description,
            CreatedAt = coupon.CreatedAt
        }, coupon.IsActive ? "تم تفعيل الكوبون." : "تم تعطيل الكوبون."));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCoupon(Guid id, CancellationToken ct = default)
    {
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coupon == null)
            return NotFound(ApiResponse<object>.Fail("الكوبون غير موجود."));

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync(ct);

        return Ok(ApiResponse<object>.Ok(null, "تم حذف الكوبون بنجاح."));
    }

    [HttpGet("settings")]
    [ProducesResponseType(typeof(ApiResponse<StoreSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings(CancellationToken ct = default)
    {
        var setting = await _context.StoreSettings.FirstOrDefaultAsync(s => s.Id == "general_settings", ct);
        bool showCoupon = setting?.ShowCouponField ?? false;

        return Ok(ApiResponse<StoreSettingsDto>.Ok(new StoreSettingsDto { ShowCouponField = showCoupon }));
    }

    [HttpPut("settings")]
    [ProducesResponseType(typeof(ApiResponse<StoreSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSettings([FromBody] StoreSettingsDto dto, CancellationToken ct = default)
    {
        var setting = await _context.StoreSettings.FirstOrDefaultAsync(s => s.Id == "general_settings", ct);
        if (setting == null)
        {
            setting = new StoreSetting
            {
                Id = "general_settings",
                ShowCouponField = dto.ShowCouponField,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.StoreSettings.AddAsync(setting, ct);
        }
        else
        {
            setting.ShowCouponField = dto.ShowCouponField;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(ct);

        return Ok(ApiResponse<StoreSettingsDto>.Ok(
            new StoreSettingsDto { ShowCouponField = setting.ShowCouponField },
            setting.ShowCouponField ? "تم تفعيل إظهار حقل الكوبون للزبائن." : "تم إخفاء حقل الكوبون عن الزبائن."
        ));
    }
}
