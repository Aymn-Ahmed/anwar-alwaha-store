namespace AnwarAlwaha.API.Entities;

public class CategoryComplementRule : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SourceCategoryId { get; set; } = string.Empty;
    public string TargetCategoryId { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigations
    public Category? SourceCategory { get; set; }
    public Category? TargetCategory { get; set; }
}
