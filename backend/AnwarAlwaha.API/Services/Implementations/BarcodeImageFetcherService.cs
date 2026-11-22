using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Products;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class BarcodeImageFetcherService : IBarcodeImageFetcherService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<BarcodeImageFetcherService> _logger;

    private readonly object _sync = new();
    private CancellationTokenSource? _cts;
    private Task? _backgroundTask;
    private bool _isRunning;
    private int _sessionProcessed;
    private int _sessionUploaded;
    private int _sessionNotFound;
    private bool _quotaExceeded;
    private string? _lastMessage;
    private string? _cachedApiKey;

    public BarcodeImageFetcherService(
        IServiceScopeFactory scopeFactory,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<BarcodeImageFetcherService> logger)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    public async Task<BarcodeImageStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var total = await db.Products.CountAsync(ct);
        var withImage = await db.Products.CountAsync(p => p.ImageUrl != null && p.ImageUrl != "", ct);
        var eligible = await db.Products.CountAsync(
            p => (p.ImageUrl == null || p.ImageUrl == "") &&
                 !p.ImageFetchAttempted &&
                 p.Name != null &&
                 p.Name != "",
            ct);
        var notFound = await db.Products.CountAsync(
            p => p.ImageFetchAttempted && (p.ImageUrl == null || p.ImageUrl == ""),
            ct);

        lock (_sync)
        {
            return new BarcodeImageStatsDto
            {
                TotalProducts = total,
                WithImageCount = withImage,
                EligibleForFetchCount = eligible,
                NotFoundCount = notFound,
                IsRunning = _isRunning,
                SessionProcessed = _sessionProcessed,
                SessionUploaded = _sessionUploaded,
                SessionNotFound = _sessionNotFound,
                QuotaExceeded = _quotaExceeded,
                LastMessage = _lastMessage
            };
        }
    }

    public async Task<BarcodeImageStatsDto> StartBackgroundFetchAsync(
        string? apiKeyOverride = null,
        int batchSize = 25,
        CancellationToken ct = default)
    {
        var apiKey = ResolveApiKey(apiKeyOverride);
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new ArgumentException("يرجى إدخال مفتاح Serper API Key");
        }

        lock (_sync)
        {
            _cachedApiKey = apiKey;

            if (_isRunning && _backgroundTask != null && !_backgroundTask.IsCompleted)
            {
                // Already running
                _lastMessage = "عملية السحب الخلفي قيد التشغيل حالياً...";
            }
            else
            {
                _cts?.Dispose();
                _cts = new CancellationTokenSource();
                _isRunning = true;
                _quotaExceeded = false;
                _lastMessage = "بدأ السحب الآلي للصور في خلفية السيرفر...";

                var token = _cts.Token;
                var effectiveBatch = Math.Clamp(batchSize <= 0 ? 25 : batchSize, 1, 50);
                _backgroundTask = Task.Run(() => RunBackgroundLoopAsync(apiKey, effectiveBatch, token));
            }
        }

        return await GetStatsAsync(ct);
    }

    public async Task<BarcodeImageStatsDto> StopBackgroundFetchAsync(CancellationToken ct = default)
    {
        lock (_sync)
        {
            if (_isRunning && _cts != null && !_cts.IsCancellationRequested)
            {
                _cts.Cancel();
                _lastMessage = "جاري إيقاف السحب الخلفي بأمان بعد انتهاء الصنف الحالي...";
            }
        }

        return await GetStatsAsync(ct);
    }

    private async Task RunBackgroundLoopAsync(string apiKey, int batchSize, CancellationToken ct)
    {
        try
        {
            while (!ct.IsCancellationRequested)
            {
                var batchRes = await FetchBatchInternalAsync(batchSize, apiKey, ct);

                lock (_sync)
                {
                    if (batchRes.QuotaExceeded)
                    {
                        _quotaExceeded = true;
                        _lastMessage = batchRes.Message;
                        break;
                    }

                    if (batchRes.RemainingEligible == 0 || batchRes.Processed == 0)
                    {
                        _lastMessage = "اكتمل فحص وسحب صور جميع الأصناف المؤهلة!";
                        break;
                    }

                    _lastMessage = $"جاري السحب في الخلفية: تم فحص {_sessionProcessed} صنف ورفع {_sessionUploaded} صورة (متبقي {batchRes.RemainingEligible}).";
                }

                await Task.Delay(250, ct);
            }
        }
        catch (OperationCanceledException)
        {
            lock (_sync)
            {
                _lastMessage = "تم إيقاف السحب التلقائي مؤقتاً.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Background image fetcher stopped due to error");
            lock (_sync)
            {
                _lastMessage = $"توقف السحب الخلفي بسبب خطأ: {ex.Message}";
            }
        }
        finally
        {
            lock (_sync)
            {
                _isRunning = false;
                if (ct.IsCancellationRequested)
                {
                    _lastMessage = "تم إيقاف السحب التلقائي مؤقتاً.";
                }
            }
        }
    }

    public async Task<BarcodeImageBatchResultDto> FetchBatchAsync(
        int batchSize = 25,
        string? apiKeyOverride = null,
        CancellationToken ct = default)
    {
        var apiKey = ResolveApiKey(apiKeyOverride);
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new ArgumentException("يرجى إدخال مفتاح Serper API Key");
        }

        lock (_sync)
        {
            _cachedApiKey = apiKey;
        }

        return await FetchBatchInternalAsync(batchSize, apiKey, ct);
    }

    private string ResolveApiKey(string? apiKeyOverride)
    {
        if (!string.IsNullOrWhiteSpace(apiKeyOverride))
            return apiKeyOverride.Trim();

        lock (_sync)
        {
            if (!string.IsNullOrWhiteSpace(_cachedApiKey))
                return _cachedApiKey!;
        }

        return (_config["SerperApiKey"] ?? Environment.GetEnvironmentVariable("SERPER_API_KEY") ?? "").Trim();
    }

    private async Task<BarcodeImageBatchResultDto> FetchBatchInternalAsync(
        int batchSize,
        string apiKey,
        CancellationToken ct)
    {
        batchSize = Math.Clamp(batchSize <= 0 ? 25 : batchSize, 1, 50);

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var batch = await db.Products
            .Where(p => (p.ImageUrl == null || p.ImageUrl == "") &&
                        !p.ImageFetchAttempted &&
                        p.Name != null &&
                        p.Name != "")
            .OrderBy(p => p.Id)
            .Take(batchSize)
            .ToListAsync(ct);

        int processed = 0;
        int foundAndUploaded = 0;
        int notFound = 0;
        bool quotaExceeded = false;
        string? statusMessage = null;
        var now = DateTime.UtcNow;

        using var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(15);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AnwarAlwahaStore/1.0");

        foreach (var product in batch)
        {
            if (ct.IsCancellationRequested) break;

            var cleanedName = CleanProductName(product.Name);
            if (string.IsNullOrWhiteSpace(cleanedName))
            {
                product.ImageFetchAttempted = true;
                product.UpdatedAt = now;
                processed++;
                notFound++;
                lock (_sync)
                {
                    _sessionProcessed++;
                    _sessionNotFound++;
                }
                continue;
            }

            var (candidateUrls, isQuotaOrAuthError, errorMsg) = await SearchSerperImagesAsync(
                client,
                cleanedName,
                apiKey,
                ct);

            if (isQuotaOrAuthError)
            {
                quotaExceeded = true;
                statusMessage = errorMsg ?? "انتهى رصيد مفتاح Serper API الحالي أو المفتاح غير صالح. يرجى إدخال مفتاح جديد للمتابعة.";
                break;
            }

            bool uploadedForProduct = false;

            foreach (var candidateUrl in candidateUrls.Take(5))
            {
                if (string.IsNullOrWhiteSpace(candidateUrl) || IsBlockedImageDomain(candidateUrl))
                    continue;

                var downloaded = await TryDownloadValidImageAsync(client, candidateUrl, ct);
                if (downloaded == null)
                    continue;

                var permanentUrl = await UploadToSupabaseStorageAsync(
                    client,
                    product.Id,
                    downloaded.Value.Bytes,
                    downloaded.Value.ContentType,
                    downloaded.Value.Extension,
                    candidateUrl,
                    ct);

                if (!string.IsNullOrWhiteSpace(permanentUrl))
                {
                    product.ImageUrl = permanentUrl;
                    uploadedForProduct = true;
                    break;
                }
            }

            product.ImageFetchAttempted = true;
            product.UpdatedAt = now;
            processed++;

            if (uploadedForProduct)
            {
                foundAndUploaded++;
                lock (_sync)
                {
                    _sessionProcessed++;
                    _sessionUploaded++;
                }
            }
            else
            {
                notFound++;
                lock (_sync)
                {
                    _sessionProcessed++;
                    _sessionNotFound++;
                }
            }
        }

        if (processed > 0)
        {
            // Save even if cancellation was requested right after the current product
            await db.SaveChangesAsync(CancellationToken.None);
        }

        var remaining = await db.Products.CountAsync(
            p => (p.ImageUrl == null || p.ImageUrl == "") &&
                 !p.ImageFetchAttempted &&
                 p.Name != null &&
                 p.Name != "",
            CancellationToken.None);

        return new BarcodeImageBatchResultDto
        {
            Processed = processed,
            FoundAndUploaded = foundAndUploaded,
            NotFound = notFound,
            RemainingEligible = remaining,
            QuotaExceeded = quotaExceeded,
            Message = statusMessage ?? $"تم فحص {processed} صنف — تم رفع {foundAndUploaded} صورة."
        };
    }

    public async Task<int> ResetAttemptsAsync(CancellationToken ct = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var items = await db.Products
            .Where(p => p.ImageFetchAttempted && (p.ImageUrl == null || p.ImageUrl == ""))
            .ToListAsync(ct);

        foreach (var p in items)
        {
            p.ImageFetchAttempted = false;
        }

        if (items.Count > 0)
        {
            await db.SaveChangesAsync(ct);
        }

        lock (_sync)
        {
            _sessionProcessed = 0;
            _sessionUploaded = 0;
            _sessionNotFound = 0;
            _quotaExceeded = false;
            _lastMessage = $"تمت إعادة تعيين {items.Count} صنف لإعادة المحاولة.";
        }

        return items.Count;
    }

    private static string CleanProductName(string rawName)
    {
        if (string.IsNullOrWhiteSpace(rawName)) return string.Empty;
        var cleaned = Regex.Replace(rawName, @"[^\p{L}\p{N}\s\.\-]", " ");
        cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim();
        return cleaned;
    }

    private static bool IsBlockedImageDomain(string url)
    {
        var lower = url.ToLowerInvariant();
        return lower.Contains("fbsbx.com") ||
               lower.Contains("lookaside.instagram.com") ||
               lower.StartsWith("x-raw-image:");
    }

    private async Task<(List<string> Urls, bool IsQuotaOrAuthError, string? ErrorMessage)> SearchSerperImagesAsync(
        HttpClient client,
        string query,
        string apiKey,
        CancellationToken ct)
    {
        var urls = new List<string>();
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, "https://google.serper.dev/images");
            req.Headers.Add("X-API-KEY", apiKey);

            var payload = JsonSerializer.Serialize(new
            {
                q = query,
                gl = "sa",
                hl = "ar",
                num = 5
            });
            req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

            using var res = await client.SendAsync(req, ct);

            if (res.StatusCode == HttpStatusCode.Unauthorized ||
                res.StatusCode == HttpStatusCode.PaymentRequired ||
                res.StatusCode == HttpStatusCode.Forbidden ||
                res.StatusCode == HttpStatusCode.TooManyRequests)
            {
                var code = (int)res.StatusCode;
                return (urls, true, $"توقف الجلب: مفتاح Serper API أرجع الكود ({code}) — انتهى رصيد الـ 2,500 بحث أو المفتاح غير صالح. يرجى لصق مفتاح جديد للمتابعة.");
            }

            if (!res.IsSuccessStatusCode)
            {
                return (urls, false, null);
            }

            await using var stream = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

            if (doc.RootElement.TryGetProperty("images", out var imagesProp) &&
                imagesProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in imagesProp.EnumerateArray())
                {
                    if (item.TryGetProperty("imageUrl", out var imgUrlProp) &&
                        imgUrlProp.ValueKind == JsonValueKind.String)
                    {
                        var u = imgUrlProp.GetString();
                        if (!string.IsNullOrWhiteSpace(u))
                        {
                            urls.Add(u);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug("Serper search exception for query '{Query}': {Message}", query, ex.Message);
        }

        return (urls, false, null);
    }

    private static async Task<(byte[] Bytes, string ContentType, string Extension)?> TryDownloadValidImageAsync(
        HttpClient client,
        string imageUrl,
        CancellationToken ct)
    {
        try
        {
            using var res = await client.GetAsync(imageUrl, ct);
            if (!res.IsSuccessStatusCode) return null;

            var contentType = res.Content.Headers.ContentType?.MediaType?.ToLowerInvariant() ?? "";
            if (!contentType.StartsWith("image/")) return null;

            var bytes = await res.Content.ReadAsByteArrayAsync(ct);
            if (bytes.Length <= 3072) return null; // Must be > 3KB

            var ext = contentType switch
            {
                "image/png" => "png",
                "image/webp" => "webp",
                "image/gif" => "gif",
                _ => "jpg"
            };

            return (bytes, contentType, ext);
        }
        catch
        {
            return null;
        }
    }

    private async Task<string?> UploadToSupabaseStorageAsync(
        HttpClient client,
        Guid productId,
        byte[] imageBytes,
        string contentType,
        string ext,
        string fallbackDirectUrl,
        CancellationToken ct)
    {
        var section = _config.GetSection("SupabaseStorage");
        var projectUrl = (section["ProjectUrl"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL") ?? "https://rnaumaaquvmfkyfrqgad.supabase.co").TrimEnd('/');
        var apiKey = section["ApiKey"] ?? Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY") ?? Environment.GetEnvironmentVariable("SUPABASE_ANON_KEY") ?? "";
        var bucket = string.IsNullOrWhiteSpace(section["Bucket"]) ? "products-images" : section["Bucket"]!.Trim();

        var objectPath = $"products/item-{productId}.{ext}";
        var uploadUrl = $"{projectUrl}/storage/v1/object/{bucket}/{objectPath}";
        var publicUrl = $"{projectUrl}/storage/v1/object/public/{bucket}/{objectPath}";

        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
            req.Headers.Add("x-upsert", "true");
            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                req.Headers.Add("apikey", apiKey);
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            }

            var content = new ByteArrayContent(imageBytes);
            content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
            req.Content = content;

            using var res = await client.SendAsync(req, ct);
            if (res.IsSuccessStatusCode)
            {
                return publicUrl;
            }

            _logger.LogWarning("Supabase Storage upload returned {StatusCode}; falling back to verified image URL.", res.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Supabase Storage upload error: {Message}; falling back to verified image URL.", ex.Message);
        }

        return fallbackDirectUrl;
    }
}
