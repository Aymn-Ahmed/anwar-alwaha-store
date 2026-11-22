using AnwarAlwaha.API.DTOs.Products;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IBarcodeImageFetcherService
{
    Task<BarcodeImageStatsDto> GetStatsAsync(CancellationToken ct = default);
    Task<BarcodeImageStatsDto> StartBackgroundFetchAsync(string? apiKeyOverride = null, int batchSize = 25, CancellationToken ct = default);
    Task<BarcodeImageStatsDto> StopBackgroundFetchAsync(CancellationToken ct = default);
    Task<BarcodeImageBatchResultDto> FetchBatchAsync(int batchSize = 25, string? apiKeyOverride = null, CancellationToken ct = default);
    Task<int> ResetAttemptsAsync(CancellationToken ct = default);
}
