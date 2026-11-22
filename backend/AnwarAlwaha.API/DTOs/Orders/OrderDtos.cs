namespace AnwarAlwaha.API.DTOs.Orders;

public class CreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Notes { get; set; }
}

public class CreateOrderDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerAddress { get; set; }
    public string DeliveryMethod { get; set; } = "branch"; // "branch" or "delivery"
    public double? CustomerLocationLat { get; set; }
    public double? CustomerLocationLng { get; set; }
    public string? CustomerNotes { get; set; }
    public string? CouponCode { get; set; }
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class OrderItemResponseDto
{
    public Guid Id { get; set; }
    public Guid? ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string? ItemNotes { get; set; }
}

public class OrderResponseDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public string DeliveryMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = "pending";
    public decimal SubtotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? CustomerNotes { get; set; }
    public string? AdminNotes { get; set; }
    public bool IsReviewed { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemResponseDto> Items { get; set; } = new();
}

public class OrderStatusUpdateDto
{
    public string Status { get; set; } = string.Empty; // pending, processing, ready, shipping, delivered, cancelled
    public string? AdminNotes { get; set; }
}

public class OrderAdminListDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string DeliveryMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int ItemsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
