namespace AnwarAlwaha.API.Entities;

public class PaymentTransaction : BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string PaymentGateway { get; set; } = "Moyasar";
    public string GatewayReferenceId { get; set; } = string.Empty; // Unique
    public string PaymentMethod { get; set; } = "mada"; // mada, applepay, creditcard
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "SAR";
    public string Status { get; set; } = "initiated"; // initiated, paid, failed, refunded
    public string? RawWebhookPayload { get; set; }
    public DateTime? PaidAt { get; set; }

    // Navigations
    public Order? Order { get; set; }
}
