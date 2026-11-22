using System.Collections.Concurrent;
using System.Text.Json;
using AnwarAlwaha.API.Common;
using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Products;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class ProductKeywordEnrichmentService : IProductKeywordEnrichmentService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ProductKeywordEnrichmentService> _logger;

    // Cache Google Autocomplete results by root query term to avoid duplicate requests
    private readonly ConcurrentDictionary<string, List<string>> _autocompleteCache = new();

    private readonly object _sync = new();
    private CancellationTokenSource? _cts;
    private Task? _backgroundTask;
    private bool _isRunning;
    private int _sessionProcessed;
    private string? _lastMessage;

    // Comprehensive Saudi dialect & standard Arabic stationery synonym clusters
    private static readonly string[][] SynonymClusters =
    {
        new[] { "قلم رصاص", "مرسام", "رصاص", "مرسمة", "مرسمه", "اقلام رصاص", "pencil" },
        new[] { "مبراة", "مبراه", "براية", "برايه", "مسن", "برات", "sharpener" },
        new[] { "ممحاة", "ممحاه", "مساحة", "مساحه", "أستيكة", "استيكه", "محاية", "محايه", "طامس", "مزيل", "كوركتر", "بلانكو", "شريط تصحيح", "eraser" },
        new[] { "دباسة", "دباسه", "تدبيس", "مكبس ورق", "دبابيس", "خرامة", "خرامه", "مشابك", "كلبس", "stapler" },
        new[] { "دفتر", "كراسة", "كراسه", "كشكول", "نوت", "نوتة", "نوته", "سجل", "مذكرة", "مذكره", "دفاتر", "دفتر سلك", "اجندة", "بلانر", "notebook" },
        new[] { "ملف", "حافظة", "حافظه", "دوسيه", "فايل", "مصنف", "ملف علاقي", "ملف شفاف", "ملف طقطق", "مجلد", "folder", "file" },
        new[] { "ورق طباعة", "ورق طباعه", "ورق تصوير", "a4", "رزمة", "رزمه", "أوراق", "اوراق", "ماعون ورق", "ورق ابيض", "paper" },
        new[] { "حبر", "تونر", "خرطوشة", "خرطوشه", "تعبئة طابعة", "تعبئه طابعه", "أحبار", "احبار", "ink", "toner" },
        new[] { "تجليد", "تغليف", "حراري", "لاصق", "شفاف", "جلاد", "سلوفان", "تغليف حراري", "سلك حلزوني" },
        new[] { "مشرط", "مقص", "قاطع", "كتر", "شفرة", "شفره", "مقصات", "cutter", "scissors" },
        new[] { "ألوان", "الوان", "تلوين", "خشبية", "خشبيه", "فلوماستر", "مائية", "مائيه", "باستيل", "أكريليك", "اكريليك", "زيتية", "كانفس", "كراسة رسم", "فرش رسم", "colors" },
        new[] { "مسطرة", "مسطره", "فرجار", "منقلة", "منقله", "أدوات هندسية", "ادوات هندسيه", "هندسة", "هندسه", "علبة هندسة", "مثلث هندسي", "ruler", "geometry" },
        new[] { "قلم", "أقلام", "اقلام", "قلم جاف", "قلم سائل", "قلم حبر", "روكو", "بيلوت", "يوني بول", "قلم سبورة", "ماركر", "هايلايتر", "تظليل", "فسفوري", "pen", "marker", "highlighter" },
        new[] { "صمغ", "غراء", "لصق", "شطرطون", "تيب", "لاصق", "سيلوتيب", "بتكس", "اوهو", "uhu", "glue", "tape" },
        new[] { "شنطة", "شنطه", "حقيبة", "حقيبه", "مقلمة", "مقلمه", "مقالم", "حقيبة ظهر", "شنط مدرسية", "bag", "backpack", "pouch" },
        new[] { "حاسبة", "حاسبه", "آلة حاسبة", "اله حاسبه", "كاسيو", "حاسبة علمية", "casio", "calculator" },
        new[] { "ختم", "أختام", "اختام", "حبارة", "حباره", "ختم شمع", "ختم اوتوماتيك", "stamp" },
        new[] { "تخرج", "وشاح", "قبعة تخرج", "روب تخرج", "درع", "دروع", "تكريم", "ميدالية", "كأس", "بوستر" },
        new[] { "بنر", "رول اب", "استكر", "ستيكر", "ملصق", "ملصقات", "فوركس", "فلين", "مجسم", "لوحة", "وسيلة تعليمية" }
    };

    private static readonly (string[] OriginalTerms, string[] NormalizedTerms)[] NormalizedClusters =
        SynonymClusters
            .Select(cluster => (
                cluster,
                cluster.Select(ArabicNormalizer.Normalize).Where(s => !string.IsNullOrEmpty(s)).Distinct().ToArray()
            ))
            .ToArray();

    public ProductKeywordEnrichmentService(
        IServiceScopeFactory scopeFactory,
        IHttpClientFactory httpClientFactory,
        ILogger<ProductKeywordEnrichmentService> logger)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public List<string> ExpandQueryTokensWithSynonyms(string rawSearch)
    {
        var normQuery = ArabicNormalizer.Normalize(rawSearch);
        var tokens = ArabicNormalizer.Tokenize(rawSearch);
        var expanded = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(rawSearch))
            expanded.Add(rawSearch.Trim().ToLowerInvariant());
        if (!string.IsNullOrWhiteSpace(normQuery))
            expanded.Add(normQuery);

        foreach (var t in tokens)
        {
            expanded.Add(t);
        }

        foreach (var (origTerms, normTerms) in NormalizedClusters)
        {
            bool clusterMatches = normTerms.Any(nt =>
                normQuery.Contains(nt) ||
                tokens.Any(tok => tok.Length >= 3 && (nt == tok || nt.Contains(tok) || tok.Contains(nt))));

            if (clusterMatches)
            {
                foreach (var ot in origTerms) expanded.Add(ot.ToLowerInvariant());
                foreach (var nt in normTerms) expanded.Add(nt);
            }
        }

        return expanded.ToList();
    }

    public async Task<string> GenerateKeywordsForProductAsync(
        string productName,
        string? categoryTitle = null,
        bool useGoogleAutocomplete = true,
        CancellationToken ct = default)
    {
        var keywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        void AddTerm(string? term)
        {
            if (string.IsNullOrWhiteSpace(term)) return;
            var clean = term.Trim();
            if (clean.Length >= 2) keywords.Add(clean);
            var norm = ArabicNormalizer.Normalize(clean);
            if (norm.Length >= 2) keywords.Add(norm);
        }

        // 1. Original & Normalized Product Name + Category + Tokens
        AddTerm(productName);
        AddTerm(categoryTitle);

        var nameTokens = ArabicNormalizer.Tokenize(productName);
        foreach (var tok in nameTokens)
        {
            AddTerm(tok);
        }

        var combinedNorm = ArabicNormalizer.Normalize($"{productName} {categoryTitle}");

        // 2. Saudi & Standard Arabic Stationery Synonym Expansion
        foreach (var (origTerms, normTerms) in NormalizedClusters)
        {
            bool matched = normTerms.Any(nt =>
                combinedNorm.Contains(nt) ||
                nameTokens.Any(tok => tok.Length >= 3 && tok == nt));

            if (matched)
            {
                foreach (var ot in origTerms) AddTerm(ot);
                foreach (var nt in normTerms) AddTerm(nt);
            }
        }

        // 3. Free Google Autocomplete Suggestions (cached by root term)
        if (useGoogleAutocomplete && nameTokens.Count > 0)
        {
            var rootTerm = string.Join(" ", nameTokens.Take(Math.Min(2, nameTokens.Count)));
            if (rootTerm.Length >= 3)
            {
                var suggestions = await GetGoogleAutocompleteSuggestionsAsync(rootTerm, ct);
                foreach (var s in suggestions)
                {
                    AddTerm(s);
                }
            }
        }

        return string.Join(", ", keywords);
    }

    private async Task<List<string>> GetGoogleAutocompleteSuggestionsAsync(string rootTerm, CancellationToken ct)
    {
        var cacheKey = ArabicNormalizer.Normalize(rootTerm);
        if (_autocompleteCache.TryGetValue(cacheKey, out var cached))
        {
            return cached;
        }

        var results = new List<string>();
        try
        {
            // Polite delay before making a new uncached request to Google Suggest
            await Task.Delay(150, ct);

            using var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AnwarAlwahaSearch/1.0");

            var url = $"https://suggestqueries.google.com/complete/search?client=firefox&hl=ar&gl=sa&q={Uri.EscapeDataString(rootTerm)}";
            using var res = await client.GetAsync(url, ct);

            if (res.IsSuccessStatusCode)
            {
                await using var stream = await res.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

                if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() >= 2)
                {
                    var arr = doc.RootElement[1];
                    if (arr.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var el in arr.EnumerateArray().Take(6))
                        {
                            if (el.ValueKind == JsonValueKind.String)
                            {
                                var s = el.GetString();
                                if (!string.IsNullOrWhiteSpace(s))
                                    results.Add(s.Trim());
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug("Google Autocomplete skipped for '{Term}': {Message}", rootTerm, ex.Message);
        }

        _autocompleteCache[cacheKey] = results;
        return results;
    }

    public async Task<KeywordEnrichmentStatusDto> GetStatusAsync(CancellationToken ct = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var total = await db.Products.CountAsync(ct);
        var enriched = await db.Products.CountAsync(
            p => p.SearchKeywords != null && p.SearchKeywords != "",
            ct);
        var remaining = Math.Max(0, total - enriched);

        lock (_sync)
        {
            return new KeywordEnrichmentStatusDto
            {
                TotalProducts = total,
                EnrichedCount = enriched,
                RemainingCount = remaining,
                IsRunning = _isRunning,
                SessionProcessed = _sessionProcessed,
                LastMessage = _lastMessage
            };
        }
    }

    public async Task<KeywordEnrichmentStatusDto> StartBackgroundEnrichmentAsync(CancellationToken ct = default)
    {
        lock (_sync)
        {
            if (_isRunning && _backgroundTask != null && !_backgroundTask.IsCompleted)
            {
                _lastMessage = "توليد الكلمات المفتاحية يعمل حالياً في الخلفية...";
            }
            else
            {
                _cts?.Dispose();
                _cts = new CancellationTokenSource();
                _isRunning = true;
                _sessionProcessed = 0;
                _lastMessage = "بدأ توليد الكلمات المفتاحية ومرادفات البحث في الخلفية...";
                var token = _cts.Token;
                _backgroundTask = Task.Run(() => RunEnrichmentLoopAsync(token));
            }
        }

        return await GetStatusAsync(ct);
    }

    public async Task<KeywordEnrichmentStatusDto> StopBackgroundEnrichmentAsync(CancellationToken ct = default)
    {
        lock (_sync)
        {
            if (_isRunning && _cts != null && !_cts.IsCancellationRequested)
            {
                _cts.Cancel();
                _lastMessage = "جاري إيقاف توليد الكلمات المفتاحية بأمان...";
            }
        }

        return await GetStatusAsync(ct);
    }

    private async Task RunEnrichmentLoopAsync(CancellationToken ct)
    {
        try
        {
            while (!ct.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var catMap = await db.Categories
                    .AsNoTracking()
                    .Select(c => new { c.Id, c.Title })
                    .ToDictionaryAsync(c => c.Id, c => c.Title, ct);

                var batch = await db.Products
                    .Where(p => p.SearchKeywords == null || p.SearchKeywords == "")
                    .OrderBy(p => p.Id)
                    .Take(50)
                    .ToListAsync(ct);

                if (batch.Count == 0)
                {
                    lock (_sync)
                    {
                        _lastMessage = "اكتمل توليد الكلمات المفتاحية ومرادفات البحث لجميع الأصناف!";
                    }
                    break;
                }

                int countInBatch = 0;
                foreach (var prod in batch)
                {
                    if (ct.IsCancellationRequested) break;

                    catMap.TryGetValue(prod.CategoryId, out var catTitle);
                    var generated = await GenerateKeywordsForProductAsync(
                        prod.Name,
                        catTitle,
                        useGoogleAutocomplete: true,
                        ct);

                    prod.SearchKeywords = string.IsNullOrWhiteSpace(generated) ? prod.Name : generated;
                    prod.UpdatedAt = DateTime.UtcNow;
                    countInBatch++;

                    lock (_sync)
                    {
                        _sessionProcessed++;
                    }
                }

                if (countInBatch > 0)
                {
                    await db.SaveChangesAsync(CancellationToken.None);
                }

                lock (_sync)
                {
                    _lastMessage = $"جاري حشو المرادفات: تم تجهيز {_sessionProcessed} صنف في هذه الجلسة...";
                }
            }
        }
        catch (OperationCanceledException)
        {
            lock (_sync)
            {
                _lastMessage = "تم إيقاف توليد الكلمات المفتاحية مؤقتاً.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in background keyword enrichment");
            lock (_sync)
            {
                _lastMessage = $"توقف التوليد بسبب خطأ: {ex.Message}";
            }
        }
        finally
        {
            lock (_sync)
            {
                _isRunning = false;
            }
        }
    }
}
