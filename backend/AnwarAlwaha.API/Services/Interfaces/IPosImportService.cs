using AnwarAlwaha.API.DTOs.Products;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IPosImportService
{
    Task<PosPreviewResultDto> PreviewAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportSummaryDto> ConfirmAsync(List<ImportProductDto> items, CancellationToken ct = default);
}
