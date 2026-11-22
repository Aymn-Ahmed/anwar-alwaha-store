using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using AnwarAlwaha.API.Common;
using AnwarAlwaha.API.DTOs.Payments;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class MoyasarPaymentService : IMoyasarPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<MoyasarPaymentService> _logger;
    private readonly MoyasarSettings _moyasarSettings;

    public MoyasarPaymentService(
        IUnitOfWork unitOfWork,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<MoyasarPaymentService> logger)
    {
        _unitOfWork = unitOfWork;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _moyasarSettings = MoyasarSettings.FromConfiguration(configuration);
    }

    public async Task<InitiatePaymentResponseDto> InitiatePaymentAsync(InitiatePaymentRequestDto request)
    {
        Order? order = null;

        if (request.OrderId.HasValue)
        {
            order = await _unitOfWork.Orders.Query()
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(request.OrderCode))
        {
            order = await _unitOfWork.Orders.Query()
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.OrderCode == request.OrderCode.Trim());
        }

        if (order == null)
            throw new KeyNotFoundException("الطلب المحدد غير موجود في النظام.");

        if (order.Payment?.Status == "paid" || order.Status == "processing" || order.Status == "delivered")
            throw new InvalidOperationException("الطلب مسدد بالفعل مسبقاً ولا يمكن إعادة السداد.");

        int amountInHalalas = (int)Math.Round(order.TotalAmount * 100);

        // Record or update PaymentTransaction as Initiated
        var paymentTx = await _unitOfWork.Payments.Query()
            .FirstOrDefaultAsync(p => p.OrderId == order.Id);

        if (paymentTx == null)
        {
            paymentTx = new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                PaymentGateway = "Moyasar",
                GatewayReferenceId = $"init_{order.OrderCode}_{Guid.NewGuid():N}",
                PaymentMethod = "mada",
                Amount = order.TotalAmount,
                Currency = "SAR",
                Status = "initiated"
            };
            await _unitOfWork.Payments.AddAsync(paymentTx);
        }
        else
        {
            paymentTx.Status = "initiated";
            paymentTx.Amount = order.TotalAmount;
            _unitOfWork.Payments.Update(paymentTx);
        }

        await _unitOfWork.CompleteAsync();

        return new InitiatePaymentResponseDto
        {
            PublishableKey = _moyasarSettings.PublishableKey,
            AmountInHalalas = amountInHalalas,
            Currency = "SAR",
            Description = $"طلب رقم {order.OrderCode} - مكتبة أنوار الواحة",
            CallbackUrl = _moyasarSettings.CallbackUrl,
            Metadata = new Dictionary<string, string>
            {
                { "orderId", order.Id.ToString() },
                { "orderCode", order.OrderCode }
            }
        };
    }

    public async Task<(bool success, string message)> ProcessWebhookAsync(
        MoyasarWebhookPayload payload,
        string rawJson,
        string? incomingSecretToken)
    {
        // 1. First Verification: Webhook Secret Constant-Time Check
        var expectedSecret = _moyasarSettings.WebhookSecret;
        var incomingSecret = incomingSecretToken ?? payload.SecretToken;

        if (string.IsNullOrWhiteSpace(expectedSecret) || string.IsNullOrWhiteSpace(incomingSecret))
        {
            _logger.LogWarning("Webhook request rejected: missing secret token.");
            throw new UnauthorizedAccessException("رمز التحقق الخاص بالـ Webhook غير متوفر أو غير صالح.");
        }

        var expectedBytes = Encoding.UTF8.GetBytes(expectedSecret);
        var incomingBytes = Encoding.UTF8.GetBytes(incomingSecret);

        if (expectedBytes.Length != incomingBytes.Length || !CryptographicOperations.FixedTimeEquals(expectedBytes, incomingBytes))
        {
            _logger.LogWarning("Webhook signature verification failed (Timing-Attack safe check).");
            throw new UnauthorizedAccessException("فشل التحقق من صحة Webhook Secret. الطلب غير موثوق.");
        }

        var paymentId = payload.Data?.Id ?? payload.Id;
        if (string.IsNullOrWhiteSpace(paymentId))
        {
            throw new ArgumentException("معرّف عملية الدفع غير موجود في حمولة الـ Webhook.");
        }

        // 2. Idempotency Check: Prevent duplicate payment processing
        var existingPaid = await _unitOfWork.Payments.Query()
            .AnyAsync(p => p.GatewayReferenceId == paymentId && p.Status == "paid");

        if (existingPaid)
        {
            _logger.LogInformation("Webhook idempotency triggered: Payment {PaymentId} was already processed as PAID.", paymentId);
            return (true, "تمت معالجة الدفعة واعتمادها مسبقاً (Idempotent Request).");
        }

        // 3. Second Verification: Direct Server-to-Server API Call to Moyasar
        var client = _httpClientFactory.CreateClient("MoyasarClient");
        var basicAuth = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_moyasarSettings.SecretKey}:"));
        var requestUrl = $"{_moyasarSettings.BaseUrl.TrimEnd('/')}/payments/{paymentId}";

        var requestMessage = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

        var response = await client.SendAsync(requestMessage);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            _logger.LogError("Direct Moyasar verification call failed: Code {StatusCode}, Response: {Error}", response.StatusCode, err);
            throw new InvalidOperationException($"فشل التحقق المباشر من خوادم Moyasar (رمز الخطأ: {response.StatusCode}).");
        }

        var verifiedPayment = await response.Content.ReadFromJsonAsync<MoyasarPaymentData>();
        if (verifiedPayment == null)
        {
            throw new InvalidOperationException("تعذر تحليل بيانات استجابة التحقق من خوادم Moyasar.");
        }

        // 4. Match Order using verified metadata or reference
        Order? order = null;
        if (verifiedPayment.Metadata != null)
        {
            if (verifiedPayment.Metadata.TryGetValue("orderCode", out var code) && !string.IsNullOrWhiteSpace(code))
            {
                order = await _unitOfWork.Orders.Query()
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.OrderCode == code.Trim());
            }
            else if (verifiedPayment.Metadata.TryGetValue("orderId", out var idStr) && Guid.TryParse(idStr, out var id))
            {
                order = await _unitOfWork.Orders.Query()
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.Id == id);
            }
        }

        if (order == null)
        {
            var tx = await _unitOfWork.Payments.Query()
                .Include(p => p.Order!)
                    .ThenInclude(o => o.Items)
                .FirstOrDefaultAsync(p => p.GatewayReferenceId == paymentId);
            order = tx?.Order;
        }

        if (order == null)
        {
            throw new KeyNotFoundException($"لم يتم العثور على طلب مطابق لمعرّف عملية الدفع ({paymentId}).");
        }

        // 5. Strict Amount & Currency Verification
        var expectedHalalas = (int)Math.Round(order.TotalAmount * 100);
        if (verifiedPayment.Amount != expectedHalalas)
        {
            _logger.LogCritical("Payment Amount Mismatch! Order {Code} requires {Expected} halalas, but Moyasar verified {Actual}", order.OrderCode, expectedHalalas, verifiedPayment.Amount);
            throw new InvalidOperationException("مبلغ الدفع المسجل في Moyasar لا يطابق إجمالي الطلب.");
        }

        if (!verifiedPayment.Currency.Equals("SAR", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("عملة الدفع غير مطابقة للريال السعودي (SAR).");
        }

        // 6. Database Transaction Execution
        using var dbTx = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var paymentTx = await _unitOfWork.Payments.Query()
                .FirstOrDefaultAsync(p => p.OrderId == order.Id);

            if (verifiedPayment.Status.Equals("paid", StringComparison.OrdinalIgnoreCase))
            {
                var method = verifiedPayment.Source?.Company ?? verifiedPayment.Source?.Type ?? "mada";

                if (paymentTx == null)
                {
                    paymentTx = new PaymentTransaction
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        PaymentGateway = "Moyasar",
                        GatewayReferenceId = paymentId,
                        PaymentMethod = method,
                        Amount = order.TotalAmount,
                        Currency = "SAR",
                        Status = "paid",
                        PaidAt = DateTime.UtcNow,
                        RawWebhookPayload = rawJson
                    };
                    await _unitOfWork.Payments.AddAsync(paymentTx);
                }
                else
                {
                    paymentTx.GatewayReferenceId = paymentId;
                    paymentTx.PaymentMethod = method;
                    paymentTx.Status = "paid";
                    paymentTx.Amount = order.TotalAmount;
                    paymentTx.PaidAt = DateTime.UtcNow;
                    paymentTx.RawWebhookPayload = rawJson;
                    _unitOfWork.Payments.Update(paymentTx);
                }

                order.Status = "processing";
                _unitOfWork.Orders.Update(order);

                await _unitOfWork.CompleteAsync();
                await dbTx.CommitAsync();

                _logger.LogInformation("Order {Code} successfully marked as PAID via Moyasar.", order.OrderCode);
                return (true, "تم تأكيد واعتماد الدفع وتحديث حالة الطلب إلى جاري التنفيذ.");
            }
            else if (verifiedPayment.Status.Equals("failed", StringComparison.OrdinalIgnoreCase))
            {
                if (paymentTx == null)
                {
                    paymentTx = new PaymentTransaction
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        PaymentGateway = "Moyasar",
                        GatewayReferenceId = paymentId,
                        PaymentMethod = verifiedPayment.Source?.Type ?? "unknown",
                        Amount = order.TotalAmount,
                        Currency = "SAR",
                        Status = "failed",
                        RawWebhookPayload = rawJson
                    };
                    await _unitOfWork.Payments.AddAsync(paymentTx);
                }
                else
                {
                    paymentTx.GatewayReferenceId = paymentId;
                    paymentTx.Status = "failed";
                    paymentTx.RawWebhookPayload = rawJson;
                    _unitOfWork.Payments.Update(paymentTx);
                }

                // Restore stock back to products
                foreach (var item in order.Items)
                {
                    if (item.ProductId.HasValue)
                    {
                        var prod = await _unitOfWork.Products.GetByIdAsync(item.ProductId.Value);
                        if (prod != null)
                        {
                            prod.StockQuantity += item.Quantity;
                            _unitOfWork.Products.Update(prod);
                        }
                    }
                }

                order.Status = "cancelled";
                order.AdminNotes = $"فشل الدفع عبر Moyasar: {verifiedPayment.Message ?? verifiedPayment.Source?.Message ?? "سبب غير محدد"}";
                _unitOfWork.Orders.Update(order);

                await _unitOfWork.CompleteAsync();
                await dbTx.CommitAsync();

                _logger.LogWarning("Order {Code} payment FAILED via Moyasar. Inventory restored.", order.OrderCode);
                return (false, "فشلت عملية الدفع وتمت استعادة المخزون وإلغاء الطلب.");
            }
            else
            {
                return (true, $"حالة الدفع الحالية: {verifiedPayment.Status}");
            }
        }
        catch
        {
            await dbTx.RollbackAsync();
            throw;
        }
    }

    public async Task<PaymentStatusResponseDto?> GetPaymentStatusAsync(
        string orderCode,
        string phoneLast4,
        string? paymentId = null,
        string? callbackStatus = null)
    {
        if (string.IsNullOrWhiteSpace(orderCode) || string.IsNullOrWhiteSpace(phoneLast4))
            return null;

        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode.Trim());

        if (order == null)
            return null;

        // IDOR Protection: Verify phone ends with phoneLast4
        var phone = order.CustomerPhone ?? string.Empty;
        if (!phone.EndsWith(phoneLast4.Trim()))
        {
            throw new UnauthorizedAccessException("رقم الجوال المدخل لا يتطابق مع بيانات الطلب.");
        }

        bool isAlreadyPaid = order.Payment?.Status == "paid" ||
                             order.Status == "processing" ||
                             order.Status == "ready" ||
                             order.Status == "shipping" ||
                             order.Status == "delivered";

        // Direct callback verification when order is still pending/initiated and paymentId is provided
        if (!isAlreadyPaid && !string.IsNullOrWhiteSpace(paymentId))
        {
            var cleanPayId = paymentId.Trim();
            bool isSandboxMode =
                string.IsNullOrWhiteSpace(_moyasarSettings.SecretKey) ||
                _moyasarSettings.SecretKey.Contains("sample", StringComparison.OrdinalIgnoreCase) ||
                _moyasarSettings.PublishableKey.Contains("sample", StringComparison.OrdinalIgnoreCase) ||
                cleanPayId.StartsWith("sim_", StringComparison.OrdinalIgnoreCase);

            var paymentTx = order.Payment ?? await _unitOfWork.Payments.Query()
                .FirstOrDefaultAsync(p => p.OrderId == order.Id);

            if (isSandboxMode)
            {
                bool simFailed =
                    cleanPayId.StartsWith("sim_fail", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(callbackStatus, "failed", StringComparison.OrdinalIgnoreCase);

                if (simFailed)
                {
                    if (paymentTx != null)
                    {
                        paymentTx.Status = "failed";
                        paymentTx.GatewayReferenceId = cleanPayId;
                        _unitOfWork.Payments.Update(paymentTx);
                        await _unitOfWork.CompleteAsync();
                    }
                }
                else
                {
                    if (paymentTx == null)
                    {
                        paymentTx = new PaymentTransaction
                        {
                            Id = Guid.NewGuid(),
                            OrderId = order.Id,
                            PaymentGateway = "Moyasar",
                            GatewayReferenceId = cleanPayId,
                            PaymentMethod = "mada",
                            Amount = order.TotalAmount,
                            Currency = "SAR",
                            Status = "paid",
                            PaidAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Payments.AddAsync(paymentTx);
                    }
                    else
                    {
                        paymentTx.GatewayReferenceId = cleanPayId;
                        paymentTx.PaymentMethod = "mada";
                        paymentTx.Status = "paid";
                        paymentTx.Amount = order.TotalAmount;
                        paymentTx.PaidAt = DateTime.UtcNow;
                        _unitOfWork.Payments.Update(paymentTx);
                    }

                    order.Status = "processing";
                    _unitOfWork.Orders.Update(order);
                    await _unitOfWork.CompleteAsync();
                    order.Payment = paymentTx;
                }
            }
            else
            {
                // Real Moyasar keys: verify payment directly with Moyasar API
                try
                {
                    var client = _httpClientFactory.CreateClient("MoyasarClient");
                    var basicAuth = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_moyasarSettings.SecretKey}:"));
                    var requestUrl = $"{_moyasarSettings.BaseUrl.TrimEnd('/')}/payments/{Uri.EscapeDataString(cleanPayId)}";

                    using var req = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                    req.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

                    using var res = await client.SendAsync(req);
                    if (res.IsSuccessStatusCode)
                    {
                        var verifiedPayment = await res.Content.ReadFromJsonAsync<MoyasarPaymentData>();
                        var expectedHalalas = (int)Math.Round(order.TotalAmount * 100);

                        if (verifiedPayment != null &&
                            verifiedPayment.Amount == expectedHalalas &&
                            verifiedPayment.Currency.Equals("SAR", StringComparison.OrdinalIgnoreCase))
                        {
                            if (verifiedPayment.Status.Equals("paid", StringComparison.OrdinalIgnoreCase))
                            {
                                var method = verifiedPayment.Source?.Company ?? verifiedPayment.Source?.Type ?? "mada";
                                if (paymentTx == null)
                                {
                                    paymentTx = new PaymentTransaction
                                    {
                                        Id = Guid.NewGuid(),
                                        OrderId = order.Id,
                                        PaymentGateway = "Moyasar",
                                        GatewayReferenceId = cleanPayId,
                                        PaymentMethod = method,
                                        Amount = order.TotalAmount,
                                        Currency = "SAR",
                                        Status = "paid",
                                        PaidAt = DateTime.UtcNow
                                    };
                                    await _unitOfWork.Payments.AddAsync(paymentTx);
                                }
                                else
                                {
                                    paymentTx.GatewayReferenceId = cleanPayId;
                                    paymentTx.PaymentMethod = method;
                                    paymentTx.Status = "paid";
                                    paymentTx.Amount = order.TotalAmount;
                                    paymentTx.PaidAt = DateTime.UtcNow;
                                    _unitOfWork.Payments.Update(paymentTx);
                                }

                                order.Status = "processing";
                                _unitOfWork.Orders.Update(order);
                                await _unitOfWork.CompleteAsync();
                                order.Payment = paymentTx;
                            }
                            else if (verifiedPayment.Status.Equals("failed", StringComparison.OrdinalIgnoreCase) && paymentTx != null)
                            {
                                paymentTx.GatewayReferenceId = cleanPayId;
                                paymentTx.Status = "failed";
                                _unitOfWork.Payments.Update(paymentTx);
                                await _unitOfWork.CompleteAsync();
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Direct Moyasar callback verification failed for {OrderCode}: {Message}", order.OrderCode, ex.Message);
                }
            }
        }

        bool isPaid = order.Payment?.Status == "paid" ||
                      order.Status == "processing" ||
                      order.Status == "ready" ||
                      order.Status == "shipping" ||
                      order.Status == "delivered";

        return new PaymentStatusResponseDto
        {
            OrderCode = order.OrderCode,
            IsPaid = isPaid,
            PaymentStatus = order.Payment?.Status ?? "not_initiated",
            OrderStatus = order.Status,
            TotalAmount = order.TotalAmount,
            PaymentMethod = order.Payment?.PaymentMethod,
            GatewayReferenceId = order.Payment?.GatewayReferenceId,
            PaidAt = order.Payment?.PaidAt
        };
    }
}
