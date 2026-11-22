namespace AnwarAlwaha.API.DTOs.Bundles;

public class BundleItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public decimal ProductPrice { get; set; }
    public int Quantity { get; set; } = 1;
}

public class BundleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BundlePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string? Badge { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public List<BundleItemDto> Items { get; set; } = new();
}

public class BundleCreateUpdateItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class BundleCreateUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BundlePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string? Badge { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public List<BundleCreateUpdateItemDto> Items { get; set; } = new();
}
