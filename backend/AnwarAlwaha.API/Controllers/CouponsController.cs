using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Coupons;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CouponsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("settings")]
    [ProducesResponseType(typeof(ApiResponse<StoreSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicCouponSettings(CancellationToken ct = default)
    {
        var setting = await _context.StoreSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == "general_settings", ct);
        bool show = setting?.ShowCouponField ?? false;

        return Ok(ApiResponse<StoreSettingsDto>.Ok(new StoreSettingsDto { ShowCouponField = show }));
    }

    [HttpPost("validate")]
    [ProducesResponseType(typeof(ApiResponse<ValidateCouponResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ValidateCouponResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequestDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            return BadRequest(ApiResponse<ValidateCouponResponseDto>.Fail("يرجى إدخال رمز الكوبون."));
        }

        var normalizedCode = dto.Code.Trim().ToUpperInvariant();
        var coupon = await _context.Coupons
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Code == normalizedCode, ct);

        if (coupon == null || !coupon.IsActive)
        {
            return BadRequest(ApiResponse<ValidateCouponResponseDto>.Fail("كود الخصم غير صحيح أو غير متاح."));
        }

        if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
        {
            return BadRequest(ApiResponse<ValidateCouponResponseDto>.Fail("عذراً، انتهت صلاحية هذا الكوبون."));
        }

        if (coupon.UsageLimit.HasValue && coupon.TimesUsed >= coupon.UsageLimit.Value)
        {
            return BadRequest(ApiResponse<ValidateCouponResponseDto>.Fail("عذراً، وصل هذا الكوبون للحد الأقصى من مرات الاستخدام."));
        }

        if (dto.Subtotal < coupon.MinOrderAmount)
        {
            return BadRequest(ApiResponse<ValidateCouponResponseDto>.Fail($"الحد الأدنى لقيمة الطلب لتطبيق هذا الكوبون هو {coupon.MinOrderAmount:0.00} ر.س"));
        }

        decimal discountAmount = 0;
        if (coupon.DiscountType == "percentage")
        {
            discountAmount = Math.Round(dto.Subtotal * (coupon.Value / 100m), 2);
            if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
            {
                discountAmount = coupon.MaxDiscountAmount.Value;
            }
        }
        else // fixed
        {
            discountAmount = Math.Min(coupon.Value, dto.Subtotal);
        }

        discountAmount = Math.Min(discountAmount, dto.Subtotal);
        decimal newTotal = Math.Max(0, dto.Subtotal - discountAmount);

        return Ok(ApiResponse<ValidateCouponResponseDto>.Ok(new ValidateCouponResponseDto
        {
            IsValid = true,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.Value,
            DiscountAmount = discountAmount,
            NewTotal = newTotal,
            Message = "تم تطبيق كود الخصم بنجاح!"
        }, "تم تطبيق كود الخصم بنجاح!"));
    }
}
