namespace AnwarAlwaha.API.Entities;

public class ProductReview : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Guid? OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public string? Comment { get; set; }
    public string[] MediaUrls { get; set; } = Array.Empty<string>();
    public bool IsApproved { get; set; } = false;

    // Navigations
    public Product? Product { get; set; }
    public Order? Order { get; set; }
}

public class AdminUser : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = "مسؤول المتجر";
    public string Role { get; set; } = "Admin";
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}
