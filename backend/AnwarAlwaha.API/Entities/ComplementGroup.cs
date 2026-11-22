namespace AnwarAlwaha.API.Entities;

public class ComplementGroup : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigations
    public ICollection<ComplementGroupItem> Items { get; set; } = new List<ComplementGroupItem>();
}

public class ComplementGroupItem : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GroupId { get; set; }
    public Guid ProductId { get; set; }

    // Navigations
    public ComplementGroup? Group { get; set; }
    public Product? Product { get; set; }
}
