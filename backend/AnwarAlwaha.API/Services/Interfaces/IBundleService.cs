using AnwarAlwaha.API.DTOs.Bundles;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IBundleService
{
    Task<List<BundleDto>> GetAllBundlesAsync(bool activeOnly = true);
    Task<BundleDto?> GetBundleByIdAsync(Guid id);
    Task<BundleDto> CreateBundleAsync(BundleCreateUpdateDto dto);
    Task<BundleDto?> UpdateBundleAsync(Guid id, BundleCreateUpdateDto dto);
    Task<bool> DeleteBundleAsync(Guid id);
}
