using System.Text.Json.Serialization;

namespace AnwarAlwaha.API.DTOs.Payments;

public class InitiatePaymentRequestDto
{
    public Guid? OrderId { get; set; }
    public string? OrderCode { get; set; }
}

public class InitiatePaymentResponseDto
{
    public string PublishableKey { get; set; } = string.Empty;
    public int AmountInHalalas { get; set; }
    public string Currency { get; set; } = "SAR";
    public string Description { get; set; } = string.Empty;
    public string CallbackUrl { get; set; } = string.Empty;
    public Dictionary<string, string> Metadata { get; set; } = new();
}

public class PaymentStatusResponseDto
{
    public string OrderCode { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public string PaymentStatus { get; set; } = string.Empty; // initiated, paid, failed, refunded
    public string OrderStatus { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? PaymentMethod { get; set; }
    public string? GatewayReferenceId { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class MoyasarWebhookPayload
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("created_at")]
    public string? CreatedAt { get; set; }

    [JsonPropertyName("secret_token")]
    public string? SecretToken { get; set; }

    [JsonPropertyName("data")]
    public MoyasarPaymentData? Data { get; set; }
}

public class MoyasarPaymentData
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public int Amount { get; set; } // in Halalas

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "SAR";

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("fee")]
    public int? Fee { get; set; }

    [JsonPropertyName("source")]
    public MoyasarPaymentSource? Source { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, string>? Metadata { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}

public class MoyasarPaymentSource
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("company")]
    public string? Company { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("number")]
    public string? Number { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}
