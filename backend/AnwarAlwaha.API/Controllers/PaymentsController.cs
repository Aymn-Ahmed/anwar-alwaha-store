using System.Text.Json;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Payments;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IMoyasarPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IMoyasarPaymentService paymentService,
        ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost("initiate")]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequestDto request)
    {
        var session = await _paymentService.InitiatePaymentAsync(request);
        return Ok(ApiResponse<InitiatePaymentResponseDto>.Ok(session, "تم تجهيز جلسة الدفع بنجاح."));
    }

    [HttpPost("webhook")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> HandleWebhook([FromBody] MoyasarWebhookPayload payload)
    {
        // Extract raw JSON for audit logging
        var rawJson = JsonSerializer.Serialize(payload);

        // Retrieve token from header or payload only (Query removed to protect against URL log leaks)
        string? incomingToken = null;
        if (Request.Headers.TryGetValue("X-Moyasar-Signature", out var sigHeader) && !string.IsNullOrWhiteSpace(sigHeader))
        {
            incomingToken = sigHeader.ToString();
        }
        else if (Request.Headers.TryGetValue("secret_token", out var tokenHeader) && !string.IsNullOrWhiteSpace(tokenHeader))
        {
            incomingToken = tokenHeader.ToString();
        }
        else
        {
            incomingToken = payload.SecretToken;
        }

        try
        {
            var (success, message) = await _paymentService.ProcessWebhookAsync(payload, rawJson, incomingToken);
            _logger.LogInformation("Webhook processed successfully: {Message}", message);
            return Ok(new { success, message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Webhook unauthorized: {Message}", ex.Message);
            return Unauthorized(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook processing error: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("verify/{orderCode}")]
    [ProducesResponseType(typeof(ApiResponse<PaymentStatusResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> VerifyPayment(
        string orderCode,
        [FromQuery] string? phoneLast4,
        [FromQuery] string? paymentId = null,
        [FromQuery] string? status = null)
    {
        if (string.IsNullOrWhiteSpace(phoneLast4) || phoneLast4.Trim().Length < 4)
        {
            return BadRequest(ApiResponse<object>.Fail("يجب تزويد آخر 4 أرقام من رقم الجوال المسجل للتحقق من هوية صاحب الطلب."));
        }

        try
        {
            var result = await _paymentService.GetPaymentStatusAsync(orderCode, phoneLast4, paymentId, status);
            if (result == null)
            {
                return NotFound(ApiResponse<object>.Fail("لم يتم العثور على طلب بهذا الرمز."));
            }

            return Ok(ApiResponse<PaymentStatusResponseDto>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(ex.Message));
        }
    }
}
