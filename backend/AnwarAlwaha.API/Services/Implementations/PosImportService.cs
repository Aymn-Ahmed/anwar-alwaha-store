using System.Globalization;
using System.Text;
using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Products;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class PosImportService : IPosImportService
{
    private const string DefaultCategory = "dept_stationery";
    private readonly AppDbContext _db;

    public PosImportService(AppDbContext db) => _db = db;

    // Keyword rules, evaluated in order. A trailing '$' means exact-token match; otherwise token-prefix / phrase match.
    private static readonly (string Category, string[] Keywords)[] Rules =
    {
        ("dept_stamps",    new[] { "ختم", "اختام", "حبارة", "حباره" }),
        ("dept_badges",    new[] { "باج", "بطاقة تعريف", "حامل بطاقة", "ليارد", "هوية بلاستيك" }),
        ("dept_shields",   new[] { "ميدالية", "ميداليات", "كاس$", "كؤوس", "كأس$", "كاسات رياضي" }),
        ("dept_laser",     new[] { "درع", "دروع", "اكريليك", "ليزر" }),
        ("dept_flags",     new[] { "علم$", "اعلام", "راية", "رايات", "سارية", "ستاند" }),
        ("dept_grad",      new[] { "تخرج", "قبعة", "قبعات" }),
        ("dept_uniform",   new[] { "تيشرت", "تي شيرت", "يونيفورم", "dtf", "زي موحد", "وشاح", "اوشحة" }),
        ("dept_themes",    new[] { "كوب$", "اكواب", "ثيم", "توزيع", "علب مياه", "تاقات" }),
        ("dept_packaging", new[] { "كيس$", "اكياس", "بوكس", "علبة هدايا", "علب هدايا", "كرتون" }),
        ("dept_print",     new[] { "بنر", "رول اب", "استكر", "ستكر", "ملصق", "فوركس", "فلين", "بلوتر", "باركود" }),
        ("dept_school",    new[] { "مجسم", "مطوية", "مطويات", "وسائل تعليمية", "لوحة", "لوحات" }),
        ("dept_art",       new[] { "جدارية", "جداريات", "خطاط", "خط$" }),
        ("dept_office",    new[] { "تصوير", "طباعة", "تغليف", "تجليد", "سلفان", "ليمنيت", "ورق a4", "ورق تصوير", "سلك تجليد" }),
        ("dept_custom",    new[] { "تصميم", "استشارة" }),
    };

    private static string Normalize(string s)
    {
        var sb = new StringBuilder(s.Length);
        foreach (var ch in s.Trim().ToLowerInvariant())
        {
            sb.Append(ch switch
            {
                'أ' or 'إ' or 'آ' => 'ا',
                'ة' => 'ه',
                'ى' => 'ي',
                _ => ch
            });
        }
        return sb.ToString();
    }

    private static readonly (string Category, string[] Keywords)[] NormalizedRules =
        Rules.Select(r => (r.Category, r.Keywords.Select(Normalize).ToArray())).ToArray();

    public static string ClassifyCategory(string name)
    {
        var norm = Normalize(name);
        var tokens = norm.Split(new[] { ' ', '-', '/', '(', ')', '،', ',', '.' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var (category, keywords) in NormalizedRules)
        {
            foreach (var kw in keywords)
            {
                if (kw.EndsWith('$'))
                {
                    var exact = kw.TrimEnd('$');
                    if (tokens.Any(t => t == exact)) return category;
                }
                else if (kw.Contains(' '))
                {
                    if (norm.Contains(kw)) return category;
                }
                else if (tokens.Any(t => t.StartsWith(kw)))
                {
                    return category;
                }
            }
        }
        return DefaultCategory;
    }

    private static List<string> SplitLine(string line)
    {
        var fields = new List<string>();
        var sb = new StringBuilder();
        bool inQuotes = false;
        for (int i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"') { sb.Append('"'); i++; }
                else inQuotes = !inQuotes;
            }
            else if (c == ';' && !inQuotes)
            {
                fields.Add(sb.ToString());
                sb.Clear();
            }
            else sb.Append(c);
        }
        fields.Add(sb.ToString());
        return fields;
    }

    private static bool TryParsePrice(string raw, out decimal price)
    {
        raw = raw.Trim().Replace(" ", "").Replace(',', '.');
        return decimal.TryParse(raw, NumberStyles.Number, CultureInfo.InvariantCulture, out price);
    }

    private static string KeyOf(string? barcode, string name) =>
        !string.IsNullOrWhiteSpace(barcode) ? "b:" + barcode.Trim() : "n:" + Normalize(name);

    public async Task<PosPreviewResultDto> PreviewAsync(Stream csvStream, CancellationToken ct = default)
    {
        var result = new PosPreviewResultDto();
        var parsed = new Dictionary<string, ImportProductDto>();

        using (var reader = new StreamReader(csvStream, new UTF8Encoding(false), detectEncodingFromByteOrderMarks: true))
        {
            string? line;
            while ((line = await reader.ReadLineAsync(ct)) != null)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                result.TotalRows++;

                var cols = SplitLine(line);
                if (cols.Count < 19) { result.SkippedRows++; continue; }

                var name = cols[2].Trim();
                if (string.IsNullOrWhiteSpace(name)
                    || name.StartsWith("صنف ابو", StringComparison.Ordinal)
                    || name.Contains("صنف عام", StringComparison.Ordinal)
                    || !TryParsePrice(cols[18], out var price) || price <= 0)
                {
                    result.SkippedRows++;
                    continue;
                }

                var barcode = cols[14].Trim();
                if (barcode.Length < 8) barcode = cols[1].Trim();
                if (barcode.Length > 64) barcode = barcode[..64];
                string? barcodeOrNull = string.IsNullOrWhiteSpace(barcode) ? null : barcode;

                if (name.Length > 300) name = name[..300];

                // Duplicates inside the file: the last occurrence wins
                parsed[KeyOf(barcodeOrNull, name)] = new ImportProductDto
                {
                    Barcode = barcodeOrNull,
                    Name = name,
                    Price = price,
                    CategoryId = ClassifyCategory(name),
                };
            }
        }

        var existing = await _db.Products.AsNoTracking()
            .Select(p => new { p.Id, p.Barcode, p.Name, p.Price })
            .ToListAsync(ct);

        var byBarcode = new Dictionary<string, (Guid Id, decimal Price)>();
        var byName = new Dictionary<string, (Guid Id, decimal Price)>();
        foreach (var p in existing)
        {
            if (!string.IsNullOrWhiteSpace(p.Barcode)) byBarcode[p.Barcode.Trim()] = (p.Id, p.Price);
            byName[Normalize(p.Name)] = (p.Id, p.Price);
        }

        foreach (var item in parsed.Values)
        {
            (Guid Id, decimal Price) match = default;
            bool found = (item.Barcode != null && byBarcode.TryGetValue(item.Barcode, out match))
                         || byName.TryGetValue(Normalize(item.Name), out match);
            if (found)
            {
                item.Status = "Update";
                item.ExistingProductId = match.Id;
                item.ExistingPrice = match.Price;
                result.UpdateCount++;
            }
            else
            {
                item.Status = "New";
                result.NewCount++;
            }
            result.Items.Add(item);
        }

        return result;
    }

    public async Task<ImportSummaryDto> ConfirmAsync(List<ImportProductDto> items, CancellationToken ct = default)
    {
        var summary = new ImportSummaryDto();
        if (items == null || items.Count == 0) return summary;

        var categoryIds = (await _db.Categories.AsNoTracking().Select(c => c.Id).ToListAsync(ct)).ToHashSet();

        var existing = await _db.Products.ToListAsync(ct);
        var byBarcode = new Dictionary<string, Product>();
        var byName = new Dictionary<string, Product>();
        foreach (var p in existing)
        {
            if (!string.IsNullOrWhiteSpace(p.Barcode)) byBarcode[p.Barcode.Trim()] = p;
            byName[Normalize(p.Name)] = p;
        }

        var toAdd = new List<Product>();
        var now = DateTime.UtcNow;

        foreach (var dto in items)
        {
            var name = dto.Name?.Trim() ?? string.Empty;
            if (name.Length == 0 || dto.Price <= 0) { summary.Skipped++; continue; }
            if (name.Length > 300) name = name[..300];

            var barcode = string.IsNullOrWhiteSpace(dto.Barcode) ? null : dto.Barcode.Trim();
            if (barcode != null && barcode.Length > 64) barcode = barcode[..64];
            var categoryId = categoryIds.Contains(dto.CategoryId) ? dto.CategoryId : DefaultCategory;
            if (!categoryIds.Contains(categoryId)) { summary.Skipped++; continue; }

            Product? match = null;
            if (barcode != null) byBarcode.TryGetValue(barcode, out match);
            match ??= byName.GetValueOrDefault(Normalize(name));

            if (match != null)
            {
                match.Price = dto.Price;
                match.CategoryId = categoryId;
                if (barcode != null) match.Barcode = barcode;
                match.UpdatedAt = now;
                summary.Updated++;
            }
            else
            {
                var product = new Product
                {
                    Name = name,
                    Barcode = barcode,
                    Price = dto.Price,
                    CategoryId = categoryId,
                    ImageUrl = null,
                    CreatedAt = now,
                };
                toAdd.Add(product);
                if (barcode != null) byBarcode[barcode] = product;
                byName[Normalize(name)] = product;
                summary.Added++;
            }
        }

        if (toAdd.Count > 0) _db.Products.AddRange(toAdd);
        await _db.SaveChangesAsync(ct);
        return summary;
    }
}
