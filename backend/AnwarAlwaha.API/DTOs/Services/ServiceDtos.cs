namespace AnwarAlwaha.API.DTOs.Services;

public class ServiceDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconName { get; set; } = "sparkles";
    public string AccentColor { get; set; } = "#0284c7";
    public string MediaType { get; set; } = "none";
    public string? MediaUrl { get; set; }
    public string? LinkedCategoryId { get; set; }
    public string? LinkedCategoryTitle { get; set; }
    public string? WhatsAppTemplate { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class ServiceCreateUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconName { get; set; } = "sparkles";
    public string AccentColor { get; set; } = "#0284c7";
    public string MediaType { get; set; } = "none"; // none, image, video, tiktok
    public string? MediaUrl { get; set; }
    public string? LinkedCategoryId { get; set; }
    public string? WhatsAppTemplate { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
