namespace AnwarAlwaha.API.Entities;

public class StoreSetting
{
    public string Id { get; set; } = "general_settings";
    public bool ShowCouponField { get; set; } = false;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
