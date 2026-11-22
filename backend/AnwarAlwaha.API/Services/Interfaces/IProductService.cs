using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Products;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsPagedAsync(ProductQueryParamsDto query, bool adminView = false);
    Task<ProductDetailDto?> GetProductByIdAsync(Guid id, bool includeDetails = false);
    Task<ProductDetailDto?> GetProductByIdOrSlugAsync(string idOrSlug, bool includeDetails = false);
    Task<ProductDto> CreateProductAsync(ProductCreateUpdateDto dto);
    Task<ProductDto?> UpdateProductAsync(Guid id, ProductCreateUpdateDto dto);
    Task<bool> DeleteProductAsync(Guid id);
    Task<bool> DeleteProductImageAsync(Guid id);
    Task<int> BulkUpdateProductsAsync(List<BulkProductUpdateItemDto> items);
    Task<int> QuickPatchProductsAsync(List<QuickProductPatchDto> items);
}
