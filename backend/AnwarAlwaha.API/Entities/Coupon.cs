namespace AnwarAlwaha.API.Entities;

public class Coupon : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // e.g. "WELCOME10"
    public string DiscountType { get; set; } = "percentage"; // "percentage" or "fixed"
    public decimal Value { get; set; } // e.g. 10 for 10% or 10 SAR
    public decimal MinOrderAmount { get; set; } = 0; // Minimum subtotal required
    public decimal? MaxDiscountAmount { get; set; } // Max discount cap for percentages
    public DateTime? ExpiryDate { get; set; }
    public int? UsageLimit { get; set; }
    public int TimesUsed { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }
}
