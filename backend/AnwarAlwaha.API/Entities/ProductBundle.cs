namespace AnwarAlwaha.API.Entities;

public class ProductBundle : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BundlePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string? Badge { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    // Navigations
    public ICollection<ProductBundleItem> Items { get; set; } = new List<ProductBundleItem>();
}

public class ProductBundleItem : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BundleId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;

    // Navigations
    public ProductBundle? Bundle { get; set; }
    public Product? Product { get; set; }
}
