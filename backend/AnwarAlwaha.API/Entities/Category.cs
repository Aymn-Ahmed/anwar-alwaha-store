namespace AnwarAlwaha.API.Entities;

public class Category : BaseEntity
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "📦";
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigations
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<ServiceItem> LinkedServices { get; set; } = new List<ServiceItem>();
}
