using AnwarAlwaha.API.DTOs.Categories;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllCategoriesAsync(bool includeInactive = false);
    Task<CategoryDto?> GetCategoryByIdAsync(string id);
    Task<CategoryDto> CreateCategoryAsync(CategoryCreateUpdateDto dto);
    Task<CategoryDto?> UpdateCategoryAsync(string id, CategoryCreateUpdateDto dto);
    Task<bool> DeleteCategoryAsync(string id);
    Task<int> TransferProductsAsync(CategoryTransferRequestDto dto);
    Task<int> ReorderCategoriesAsync(List<CategoryReorderItemDto> items);
}
