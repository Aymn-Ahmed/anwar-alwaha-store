namespace AnwarAlwaha.API.DTOs.Categories;

public class CategoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "📦";
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public int ProductsCount { get; set; }
    public bool IsActive { get; set; }
}

public class CategoryCreateUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "📦";
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

public class CategoryReorderItemDto
{
    public string Id { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class CategoryTransferRequestDto
{
    public string TargetCategoryId { get; set; } = string.Empty;
    public List<Guid> ProductIds { get; set; } = new();
}
