namespace AnwarAlwaha.API.Entities;

public class Order : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public string DeliveryMethod { get; set; } = "branch"; // branch, delivery
    public double? CustomerLocationLat { get; set; }
    public double? CustomerLocationLng { get; set; }
    public string Status { get; set; } = "pending"; // pending, processing, ready, shipping, delivered, cancelled
    public decimal SubtotalAmount { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public string? CustomerNotes { get; set; }
    public string? AdminNotes { get; set; }
    public bool IsReviewed { get; set; } = false;

    // Navigations
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public PaymentTransaction? Payment { get; set; }
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
}

public class OrderItem : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public decimal UnitPriceSnapshot { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal LineTotal { get; set; }
    public string? ItemNotes { get; set; }

    // Navigations
    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
