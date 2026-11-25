namespace AnwarAlwaha.API.Entities;

public class ServiceItem : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconName { get; set; } = "sparkles";
    public string AccentColor { get; set; } = "#0284c7";
    public string MediaType { get; set; } = "none"; // none, image, video, tiktok
    public string? MediaUrl { get; set; }
    public string? LinkedCategoryId { get; set; }
    public string? WhatsAppTemplate { get; set; }
    public string? DetailedOverview { get; set; }
    public string? AvailableOptionsOrSizes { get; set; }
    public string? GalleryImageUrls { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigations
    public Category? LinkedCategory { get; set; }
}
