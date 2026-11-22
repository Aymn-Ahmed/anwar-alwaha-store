namespace AnwarAlwaha.API.DTOs.Complements;

public class ComplementGroupProductDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public string CategoryId { get; set; } = string.Empty;
}

public class ComplementGroupDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<ComplementGroupProductDto> Products { get; set; } = new();
}

public class ComplementGroupCreateUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public List<Guid> ProductIds { get; set; } = new();
}

public class CategoryComplementRuleDto
{
    public Guid Id { get; set; }
    public string SourceCategoryId { get; set; } = string.Empty;
    public string SourceCategoryTitle { get; set; } = string.Empty;
    public string TargetCategoryId { get; set; } = string.Empty;
    public string TargetCategoryTitle { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CategoryComplementRuleCreateDto
{
    public string SourceCategoryId { get; set; } = string.Empty;
    public string TargetCategoryId { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
