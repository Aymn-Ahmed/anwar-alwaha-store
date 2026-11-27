using AnwarAlwaha.API.DTOs.Categories;

namespace AnwarAlwaha.API.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public string CategoryId { get; set; } = string.Empty;
    public string CategoryTitle { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? SearchKeywords { get; set; }
    public string? ImageUrl { get; set; }
    public string? TikTokVideoId { get; set; }
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int? DiscountPercent { get; set; }
    public int SortOrder { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public bool IsVerifiedPhoto { get; set; }
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
}

public class CatalogIndexItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsVerifiedPhoto { get; set; }
    public string CategoryId { get; set; } = string.Empty;
    public string? CategoryTitle { get; set; }
    public string? Barcode { get; set; }
    public string? SearchKeywords { get; set; }
}

public class ProductDetailDto : ProductDto
{
    public List<ProductDto> ComplementaryProducts { get; set; } = new();
    public List<ProductBundleSimpleDto> RelatedBundles { get; set; } = new();
}

public class ProductBundleSimpleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal BundlePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string? Badge { get; set; }
}

public class ProductCreateUpdateDto
{
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
    public bool? IsVerifiedPhoto { get; set; }
}

public class BulkProductUpdateItemDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public decimal? OldPrice { get; set; }
    public bool ClearOldPrice { get; set; }
    public string? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public int? StockQuantity { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsVerifiedPhoto { get; set; }
}

public class QuickProductPatchDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public int? DiscountPercent { get; set; }
    public string? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsVerifiedPhoto { get; set; }
}

public class ProductQueryParamsDto
{
    public string? Search { get; set; }
    public string? CategoryId { get; set; }
    public string? ImageFilter { get; set; } // "all", "without_image", "no_image", "with_image"
    public string? HasImage { get; set; }
    public string? SortBy { get; set; } // "price_asc", "price_desc", "name", "newest"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
