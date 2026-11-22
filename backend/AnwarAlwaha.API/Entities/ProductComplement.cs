namespace AnwarAlwaha.API.Entities;

public class ProductComplement : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Guid ComplementId { get; set; }

    // Navigations
    public Product? Product { get; set; }
    public Product? Complement { get; set; }
}
