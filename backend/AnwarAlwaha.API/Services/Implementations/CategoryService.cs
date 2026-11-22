using AnwarAlwaha.API.DTOs.Categories;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync(bool includeInactive = false)
    {
        var query = _unitOfWork.Categories.Query().AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        try
        {
            return await query
                .OrderBy(c => c.SortOrder)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Icon = c.Icon,
                    ImageUrl = c.ImageUrl,
                    SortOrder = c.SortOrder,
                    IsActive = c.IsActive,
                    ProductsCount = c.Products.Count(p => p.IsActive)
                })
                .ToListAsync();
        }
        catch
        {
            return await query
                .OrderBy(c => c.SortOrder)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Icon = c.Icon,
                    ImageUrl = null,
                    SortOrder = c.SortOrder,
                    IsActive = c.IsActive,
                    ProductsCount = c.Products.Count(p => p.IsActive)
                })
                .ToListAsync();
        }
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(string id)
    {
        var category = await _unitOfWork.Categories.Query()
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Icon = c.Icon,
                ImageUrl = c.ImageUrl,
                SortOrder = c.SortOrder,
                IsActive = c.IsActive,
                ProductsCount = c.Products.Count(p => p.IsActive)
            })
            .FirstOrDefaultAsync();

        return category;
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateUpdateDto dto)
    {
        // Generate a slug/id from title or guid
        var id = Guid.NewGuid().ToString("N")[..8];
        var category = new Category
        {
            Id = id,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "📦" : dto.Icon.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim(),
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive
        };

        await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.CompleteAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Title = category.Title,
            Description = category.Description,
            Icon = category.Icon,
            ImageUrl = category.ImageUrl,
            SortOrder = category.SortOrder,
            IsActive = category.IsActive,
            ProductsCount = 0
        };
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(string id, CategoryCreateUpdateDto dto)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null)
            return null;

        category.Title = dto.Title.Trim();
        category.Description = dto.Description?.Trim();
        category.Icon = string.IsNullOrWhiteSpace(dto.Icon) ? category.Icon : dto.Icon.Trim();
        category.ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim();
        category.SortOrder = dto.SortOrder;
        category.IsActive = dto.IsActive;

        _unitOfWork.Categories.Update(category);
        await _unitOfWork.CompleteAsync();

        var count = await _unitOfWork.Products.Query().CountAsync(p => p.CategoryId == id && p.IsActive);

        return new CategoryDto
        {
            Id = category.Id,
            Title = category.Title,
            Description = category.Description,
            Icon = category.Icon,
            ImageUrl = category.ImageUrl,
            SortOrder = category.SortOrder,
            IsActive = category.IsActive,
            ProductsCount = count
        };
    }

    public async Task<bool> DeleteCategoryAsync(string id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null)
            return false;

        // Check if there are products
        var hasProducts = await _unitOfWork.Products.Query().AnyAsync(p => p.CategoryId == id);
        if (hasProducts)
        {
            // Soft delete by deactivating
            category.IsActive = false;
            _unitOfWork.Categories.Update(category);
        }
        else
        {
            _unitOfWork.Categories.Remove(category);
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<int> TransferProductsAsync(CategoryTransferRequestDto dto)
    {
        var targetExists = await _unitOfWork.Categories.Query().AnyAsync(c => c.Id == dto.TargetCategoryId);
        if (!targetExists)
            throw new KeyNotFoundException($"القسم المستهدف ({dto.TargetCategoryId}) غير موجود.");

        if (dto.ProductIds == null || dto.ProductIds.Count == 0)
            return 0;

        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var products = await _unitOfWork.Products.Query()
                .Where(p => dto.ProductIds.Contains(p.Id))
                .ToListAsync();

            foreach (var product in products)
            {
                product.CategoryId = dto.TargetCategoryId;
                _unitOfWork.Products.Update(product);
            }

            await _unitOfWork.CompleteAsync();
            await transaction.CommitAsync();

            return products.Count;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<int> ReorderCategoriesAsync(List<CategoryReorderItemDto> items)
    {
        if (items == null || items.Count == 0)
            return 0;

        var ids = items.Select(i => i.Id).Distinct().ToList();
        var categories = await _unitOfWork.Categories.Query()
            .Where(c => ids.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id);

        int count = 0;
        foreach (var item in items)
        {
            if (categories.TryGetValue(item.Id, out var cat))
            {
                cat.SortOrder = item.SortOrder;
                _unitOfWork.Categories.Update(cat);
                count++;
            }
        }

        if (count > 0)
            await _unitOfWork.CompleteAsync();

        return count;
    }
}
