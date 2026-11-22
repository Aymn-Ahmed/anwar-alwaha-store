using AnwarAlwaha.API.DTOs.Products;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IProductKeywordEnrichmentService
{
    Task<string> GenerateKeywordsForProductAsync(
        string productName,
        string? categoryTitle = null,
        bool useGoogleAutocomplete = true,
        CancellationToken ct = default);

    List<string> ExpandQueryTokensWithSynonyms(string rawSearch);

    Task<KeywordEnrichmentStatusDto> GetStatusAsync(CancellationToken ct = default);
    Task<KeywordEnrichmentStatusDto> StartBackgroundEnrichmentAsync(CancellationToken ct = default);
    Task<KeywordEnrichmentStatusDto> StopBackgroundEnrichmentAsync(CancellationToken ct = default);
}
