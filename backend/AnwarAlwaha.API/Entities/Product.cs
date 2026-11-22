namespace AnwarAlwaha.API.Entities;

public class Product : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CategoryId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? SearchKeywords { get; set; }
    public string? ImageUrl { get; set; }
    public string? TikTokVideoId { get; set; }
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int SortOrder { get; set; } = 0;
    public int StockQuantity { get; set; } = 100;
    public bool IsActive { get; set; } = true;
    public bool ImageFetchAttempted { get; set; } = false;

    // Optimistic Concurrency Token (PostgreSQL xmin system column)
    public uint Version { get; set; }

    // Navigations
    public Category? Category { get; set; }
    public ICollection<ProductComplement> Complements { get; set; } = new List<ProductComplement>();
    public ICollection<ProductComplement> ComplementedBy { get; set; } = new List<ProductComplement>();
    public ICollection<ComplementGroupItem> ComplementGroupItems { get; set; } = new List<ComplementGroupItem>();
    public ICollection<ProductBundleItem> BundleItems { get; set; } = new List<ProductBundleItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
}
