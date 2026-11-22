using AnwarAlwaha.API.DTOs.Bundles;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class BundleService : IBundleService
{
    private readonly IUnitOfWork _unitOfWork;

    public BundleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<BundleDto>> GetAllBundlesAsync(bool activeOnly = true)
    {
        var query = _unitOfWork.ProductBundles.Query()
            .Include(b => b.Items)
                .ThenInclude(i => i.Product)
            .AsQueryable();

        if (activeOnly)
        {
            query = query.Where(b => b.IsActive);
        }

        return await query
            .OrderBy(b => b.SortOrder)
            .Select(b => new BundleDto
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                BundlePrice = b.BundlePrice,
                OriginalPrice = b.OriginalPrice,
                Badge = b.Badge,
                SortOrder = b.SortOrder,
                IsActive = b.IsActive,
                Items = b.Items.Select(i => new BundleItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product != null ? i.Product.Name : string.Empty,
                    ProductImageUrl = i.Product != null ? i.Product.ImageUrl : null,
                    ProductPrice = i.Product != null ? i.Product.Price : 0,
                    Quantity = i.Quantity
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<BundleDto?> GetBundleByIdAsync(Guid id)
    {
        var bundle = await _unitOfWork.ProductBundles.Query()
            .Include(b => b.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bundle == null)
            return null;

        return new BundleDto
        {
            Id = bundle.Id,
            Title = bundle.Title,
            Description = bundle.Description,
            BundlePrice = bundle.BundlePrice,
            OriginalPrice = bundle.OriginalPrice,
            Badge = bundle.Badge,
            SortOrder = bundle.SortOrder,
            IsActive = bundle.IsActive,
            Items = bundle.Items.Select(i => new BundleItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product != null ? i.Product.Name : string.Empty,
                ProductImageUrl = i.Product != null ? i.Product.ImageUrl : null,
                ProductPrice = i.Product != null ? i.Product.Price : 0,
                Quantity = i.Quantity
            }).ToList()
        };
    }

    public async Task<BundleDto> CreateBundleAsync(BundleCreateUpdateDto dto)
    {
        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var bundle = new ProductBundle
            {
                Id = Guid.NewGuid(),
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                BundlePrice = dto.BundlePrice,
                OriginalPrice = dto.OriginalPrice,
                Badge = dto.Badge?.Trim(),
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive
            };

            await _unitOfWork.ProductBundles.AddAsync(bundle);

            var items = new List<ProductBundleItem>();
            foreach (var item in dto.Items)
            {
                items.Add(new ProductBundleItem
                {
                    Id = Guid.NewGuid(),
                    BundleId = bundle.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity
                });
            }

            if (items.Count > 0)
            {
                await _unitOfWork.ProductBundleItems.AddRangeAsync(items);
            }

            await _unitOfWork.CompleteAsync();
            await transaction.CommitAsync();

            return (await GetBundleByIdAsync(bundle.Id))!;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<BundleDto?> UpdateBundleAsync(Guid id, BundleCreateUpdateDto dto)
    {
        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var bundle = await _unitOfWork.ProductBundles.Query()
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (bundle == null)
                return null;

            bundle.Title = dto.Title.Trim();
            bundle.Description = dto.Description?.Trim();
            bundle.BundlePrice = dto.BundlePrice;
            bundle.OriginalPrice = dto.OriginalPrice;
            bundle.Badge = dto.Badge?.Trim();
            bundle.SortOrder = dto.SortOrder;
            bundle.IsActive = dto.IsActive;

            // Remove existing items and add new
            foreach (var oldItem in bundle.Items.ToList())
            {
                _unitOfWork.ProductBundleItems.Remove(oldItem);
            }

            foreach (var item in dto.Items)
            {
                await _unitOfWork.ProductBundleItems.AddAsync(new ProductBundleItem
                {
                    Id = Guid.NewGuid(),
                    BundleId = bundle.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity
                });
            }

            _unitOfWork.ProductBundles.Update(bundle);
            await _unitOfWork.CompleteAsync();
            await transaction.CommitAsync();

            return await GetBundleByIdAsync(id);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteBundleAsync(Guid id)
    {
        var bundle = await _unitOfWork.ProductBundles.GetByIdAsync(id);
        if (bundle == null)
            return false;

        bundle.IsActive = false;
        _unitOfWork.ProductBundles.Update(bundle);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
