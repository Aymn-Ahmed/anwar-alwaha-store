using AnwarAlwaha.API.DTOs.Payments;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IMoyasarPaymentService
{
    Task<InitiatePaymentResponseDto> InitiatePaymentAsync(InitiatePaymentRequestDto request);
    Task<(bool success, string message)> ProcessWebhookAsync(MoyasarWebhookPayload payload, string rawJson, string? incomingSecretToken);
    Task<PaymentStatusResponseDto?> GetPaymentStatusAsync(string orderCode, string phoneLast4, string? paymentId = null, string? callbackStatus = null);
}
