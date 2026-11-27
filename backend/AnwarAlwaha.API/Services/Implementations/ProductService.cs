using AnwarAlwaha.API.Common;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Products;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IProductKeywordEnrichmentService _keywordEnrichment;

    public ProductService(
        IUnitOfWork unitOfWork,
        IProductKeywordEnrichmentService keywordEnrichment)
    {
        _unitOfWork = unitOfWork;
        _keywordEnrichment = keywordEnrichment;
    }

    public async Task<List<CatalogIndexItemDto>> GetCatalogIndexAsync()
    {
        var categoryMap = await _unitOfWork.Categories.Query()
            .AsNoTracking()
            .Select(c => new { c.Id, c.Title })
            .ToDictionaryAsync(c => c.Id, c => c.Title);

        var products = await _unitOfWork.Products.Query()
            .AsNoTracking()
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.OldPrice,
                p.ImageUrl,
                p.IsVerifiedPhoto,
                p.CategoryId,
                p.Barcode,
                p.SearchKeywords
            })
            .ToListAsync();

        return products.Select(p => new CatalogIndexItemDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            OldPrice = p.OldPrice,
            ImageUrl = p.ImageUrl,
            IsVerifiedPhoto = p.IsVerifiedPhoto,
            CategoryId = p.CategoryId,
            CategoryTitle = categoryMap.TryGetValue(p.CategoryId, out var title) ? title : null,
            Barcode = p.Barcode,
            SearchKeywords = p.SearchKeywords
        }).ToList();
    }

    public async Task<PagedResult<ProductDto>> GetProductsPagedAsync(ProductQueryParamsDto query, bool adminView = false)
    {
        var dbQuery = _unitOfWork.Products.Query().AsNoTracking();

        if (!adminView)
        {
            dbQuery = dbQuery.Where(p => p.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(query.CategoryId))
        {
            var catId = query.CategoryId.Trim();
            dbQuery = dbQuery.Where(p => p.CategoryId == catId);
        }

        var effectiveImageFilter = !string.IsNullOrWhiteSpace(query.ImageFilter)
            ? query.ImageFilter.Trim().ToLower()
            : !string.IsNullOrWhiteSpace(query.HasImage)
                ? query.HasImage.Trim().ToLower()
                : null;

        if (!string.IsNullOrWhiteSpace(effectiveImageFilter) && effectiveImageFilter != "all")
        {
            if (effectiveImageFilter is "without_image" or "no_image")
            {
                dbQuery = dbQuery.Where(p =>
                    p.ImageUrl == null ||
                    p.ImageUrl == "" ||
                    p.ImageUrl.ToLower().Contains("placeholder") ||
                    p.ImageUrl.ToLower().Contains("default") ||
                    p.ImageUrl.StartsWith("data:image/svg"));
            }
            else if (effectiveImageFilter == "with_image")
            {
                dbQuery = dbQuery.Where(p =>
                    p.ImageUrl != null &&
                    p.ImageUrl != "" &&
                    !p.ImageUrl.ToLower().Contains("placeholder") &&
                    !p.ImageUrl.ToLower().Contains("default") &&
                    !p.ImageUrl.StartsWith("data:image/svg"));
            }
        }

        // Fetch category metadata once (avoids INNER JOIN filtering out products with unlinked CategoryId)
        var categoryMap = await _unitOfWork.Categories.Query()
            .AsNoTracking()
            .Select(c => new { c.Id, c.Title, c.Icon })
            .ToDictionaryAsync(c => c.Id, c => (c.Title, c.Icon));

        int page = Math.Max(1, query.Page);
        int pageSize = Math.Clamp(query.PageSize, 1, 100);

        bool hasSearch = !string.IsNullOrWhiteSpace(query.Search);

        if (hasSearch)
        {
            var rawSearch = query.Search!.Trim().ToLower();
            var normSearch = ArabicNormalizer.Normalize(rawSearch);
            var tokens = ArabicNormalizer.Tokenize(rawSearch);
            var expandedTerms = _keywordEnrichment.ExpandQueryTokensWithSynonyms(rawSearch);

            // Categories whose title matches the search
            var matchingCategoryIds = categoryMap
                .Where(kv =>
                {
                    var normCat = ArabicNormalizer.Normalize(kv.Value.Title);
                    return normCat.Contains(normSearch) ||
                           tokens.All(t => normCat.Contains(t)) ||
                           expandedTerms.Any(et => et.Length >= 3 && normCat.Contains(et));
                })
                .Select(kv => kv.Key)
                .ToList();

            // Broad SQL pre-filter using ANY expanded synonym/token or category match
            dbQuery = dbQuery.Where(p =>
                p.Name.ToLower().Contains(rawSearch) ||
                (p.SearchKeywords != null && p.SearchKeywords.ToLower().Contains(rawSearch)) ||
                (p.Barcode != null && p.Barcode.ToLower().Contains(rawSearch)) ||
                matchingCategoryIds.Contains(p.CategoryId) ||
                expandedTerms.Any(term =>
                    p.Name.ToLower().Contains(term) ||
                    (p.SearchKeywords != null && p.SearchKeywords.ToLower().Contains(term))));

            var candidateRows = await dbQuery
                .Select(p => new
                {
                    p.Id,
                    p.CategoryId,
                    p.Name,
                    p.Barcode,
                    p.SearchKeywords,
                    p.ImageUrl,
                    p.TikTokVideoId,
                    p.Price,
                    p.OldPrice,
                    p.SortOrder,
                    p.StockQuantity,
                    p.IsActive,
                    p.CreatedAt
                })
                .ToListAsync();

            // Rank & filter candidates in memory with full ArabicNormalizer & token matching
            var scored = candidateRows
                .Select(p =>
                {
                    var hasCat = categoryMap.TryGetValue(p.CategoryId, out var catInfo);
                    var catTitle = hasCat ? catInfo.Title : string.Empty;

                    var normName = ArabicNormalizer.Normalize(p.Name);
                    var normKeywords = ArabicNormalizer.Normalize(p.SearchKeywords);
                    var normCat = ArabicNormalizer.Normalize(catTitle);
                    var barcodeLower = (p.Barcode ?? string.Empty).ToLowerInvariant();

                    // Check if all query tokens match (either directly or via expanded synonyms)
                    bool allTokensMatch = tokens.Count == 0 || tokens.All(tok =>
                        normName.Contains(tok) ||
                        normKeywords.Contains(tok) ||
                        normCat.Contains(tok) ||
                        barcodeLower.Contains(tok) ||
                        expandedTerms.Any(et => normName.Contains(et) || normKeywords.Contains(et)));

                    if (!allTokensMatch)
                        return (Row: p, Score: -1, CatTitle: catTitle, CatIcon: hasCat ? catInfo.Icon : "📦");

                    int score = 0;
                    if (normName == normSearch || p.Name.ToLowerInvariant() == rawSearch)
                        score += 1000;
                    else if (normName.StartsWith(normSearch))
                        score += 700;
                    else if (normName.Contains(normSearch))
                        score += 500;
                    else if (tokens.Count > 0 && tokens.All(t => normName.Contains(t)))
                        score += 350;

                    if (!string.IsNullOrEmpty(barcodeLower) && barcodeLower.Contains(rawSearch))
                        score += 400;

                    if (!string.IsNullOrEmpty(normKeywords))
                    {
                        if (normKeywords.Contains(normSearch))
                            score += 200;
                        else if (expandedTerms.Any(et => normKeywords.Contains(et) || normName.Contains(et)))
                            score += 120;
                    }

                    if (normCat.Contains(normSearch))
                        score += 80;

                    return (Row: p, Score: Math.Max(1, score), CatTitle: catTitle, CatIcon: hasCat ? catInfo.Icon : "📦");
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .ThenBy(x => x.Row.SortOrder)
                .ThenByDescending(x => x.Row.CreatedAt)
                .ToList();

            int totalSearchCount = scored.Count;

            var pagedItems = scored
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ProductDto
                {
                    Id = x.Row.Id,
                    CategoryId = x.Row.CategoryId,
                    CategoryTitle = x.CatTitle,
                    CategoryIcon = x.CatIcon,
                    Name = x.Row.Name,
                    Barcode = x.Row.Barcode,
                    SearchKeywords = x.Row.SearchKeywords,
                    ImageUrl = x.Row.ImageUrl,
                    TikTokVideoId = x.Row.TikTokVideoId,
                    Price = x.Row.Price,
                    OldPrice = x.Row.OldPrice,
                    DiscountPercent = x.Row.OldPrice.HasValue && x.Row.OldPrice.Value > x.Row.Price
                        ? (int)Math.Round(((x.Row.OldPrice.Value - x.Row.Price) / x.Row.OldPrice.Value) * 100)
                        : null,
                    SortOrder = x.Row.SortOrder,
                    StockQuantity = x.Row.StockQuantity,
                    IsActive = x.Row.IsActive,
                    IsVerifiedPhoto = x.Row.IsVerifiedPhoto,
                    AverageRating = 5.0,
                    ReviewsCount = 0
                })
                .ToList();

            return new PagedResult<ProductDto>
            {
                Items = pagedItems,
                TotalCount = totalSearchCount,
                Page = page,
                PageSize = pageSize
            };
        }

        int totalCount = await dbQuery.CountAsync();

        dbQuery = query.SortBy?.ToLower() switch
        {
            "price_asc" => dbQuery.OrderBy(p => p.Price),
            "price_desc" => dbQuery.OrderByDescending(p => p.Price),
            "name" => dbQuery.OrderBy(p => p.Name),
            "newest" => dbQuery.OrderByDescending(p => p.CreatedAt),
            _ => dbQuery.OrderBy(p => p.SortOrder).ThenByDescending(p => p.CreatedAt)
        };

        var rawItems = await dbQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.CategoryId,
                p.Name,
                p.Barcode,
                p.SearchKeywords,
                p.ImageUrl,
                p.TikTokVideoId,
                p.Price,
                p.OldPrice,
                p.SortOrder,
                p.StockQuantity,
                p.IsActive,
                p.IsVerifiedPhoto,
                ApprovedReviewsCount = p.Reviews.Count(r => r.IsApproved),
                ApprovedReviewsAvg = p.Reviews.Where(r => r.IsApproved).Select(r => (double?)r.Rating).Average()
            })
            .ToListAsync();

        var items = rawItems.Select(p =>
        {
            var hasCat = categoryMap.TryGetValue(p.CategoryId, out var catInfo);
            return new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                CategoryTitle = hasCat ? catInfo.Title : string.Empty,
                CategoryIcon = hasCat ? catInfo.Icon : "📦",
                Name = p.Name,
                Barcode = p.Barcode,
                SearchKeywords = p.SearchKeywords,
                ImageUrl = p.ImageUrl,
                TikTokVideoId = p.TikTokVideoId,
                Price = p.Price,
                OldPrice = p.OldPrice,
                DiscountPercent = p.OldPrice.HasValue && p.OldPrice.Value > p.Price
                    ? (int)Math.Round(((p.OldPrice.Value - p.Price) / p.OldPrice.Value) * 100)
                    : null,
                SortOrder = p.SortOrder,
                StockQuantity = p.StockQuantity,
                IsActive = p.IsActive,
                IsVerifiedPhoto = p.IsVerifiedPhoto,
                AverageRating = p.ApprovedReviewsAvg ?? 5.0,
                ReviewsCount = p.ApprovedReviewsCount
            };
        }).ToList();

        return new PagedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductDetailDto?> GetProductByIdOrSlugAsync(string idOrSlug, bool includeDetails = false)
    {
        if (string.IsNullOrWhiteSpace(idOrSlug))
            return null;

        var trimmed = Uri.UnescapeDataString(idOrSlug.Trim());

        if (Guid.TryParse(trimmed, out var guid))
        {
            var byId = await GetProductByIdAsync(guid, includeDetails);
            if (byId != null) return byId;
        }

        var prod = await _unitOfWork.Products.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                (p.Barcode != null && p.Barcode == trimmed) ||
                p.Name == trimmed);

        if (prod == null)
            return null;

        return await GetProductByIdAsync(prod.Id, includeDetails);
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(Guid id, bool includeDetails = false)
    {
        // Query product directly without INNER JOIN on Category so unlinked CategoryId or schema differences never hide a product
        var product = await _unitOfWork.Products.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return null;

        string categoryTitle = string.Empty;
        string? categoryIcon = "📦";
        try
        {
            var cat = await _unitOfWork.Categories.Query()
                .AsNoTracking()
                .Where(c => c.Id == product.CategoryId)
                .Select(c => new { c.Title, c.Icon })
                .FirstOrDefaultAsync();
            if (cat != null)
            {
                categoryTitle = cat.Title;
                categoryIcon = cat.Icon;
            }
        }
        catch
        {
            // ignore category lookup errors
        }

        double avgRating = 5.0;
        int reviewsCount = 0;
        try
        {
            var approvedRatings = await _unitOfWork.Reviews.Query()
                .AsNoTracking()
                .Where(r => r.ProductId == id && r.IsApproved)
                .Select(r => r.Rating)
                .ToListAsync();
            if (approvedRatings.Count > 0)
            {
                reviewsCount = approvedRatings.Count;
                avgRating = approvedRatings.Average();
            }
        }
        catch
        {
            // ignore review lookup errors
        }

        var dto = new ProductDetailDto
        {
            Id = product.Id,
            CategoryId = product.CategoryId,
            CategoryTitle = categoryTitle,
            CategoryIcon = categoryIcon,
            Name = product.Name,
            ImageUrl = product.ImageUrl,
            TikTokVideoId = product.TikTokVideoId,
            Price = product.Price,
            OldPrice = product.OldPrice,
            DiscountPercent = product.OldPrice.HasValue && product.OldPrice.Value > product.Price
                ? (int)Math.Round(((product.OldPrice.Value - product.Price) / product.OldPrice.Value) * 100)
                : null,
            SortOrder = product.SortOrder,
            StockQuantity = product.StockQuantity,
            IsActive = product.IsActive,
            IsVerifiedPhoto = product.IsVerifiedPhoto,
            AverageRating = avgRating,
            ReviewsCount = reviewsCount
        };

        if (includeDetails)
        {
            try
            {
                var complements = await _unitOfWork.Products.Query()
                    .AsNoTracking()
                    .Where(p => p.IsActive && p.Id != product.Id && p.CategoryId == product.CategoryId)
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(3)
                    .Select(c => new ProductDto
                    {
                        Id = c.Id,
                        CategoryId = c.CategoryId,
                        CategoryTitle = categoryTitle,
                        CategoryIcon = categoryIcon,
                        Name = c.Name,
                        ImageUrl = c.ImageUrl,
                        IsVerifiedPhoto = c.IsVerifiedPhoto,
                        Price = c.Price,
                        OldPrice = c.OldPrice,
                        StockQuantity = c.StockQuantity,
                        IsActive = c.IsActive
                    })
                    .ToListAsync();

                dto.ComplementaryProducts = complements;
            }
            catch
            {
                dto.ComplementaryProducts = new List<ProductDto>();
            }
        }

        return dto;
    }

    public async Task<ProductDto> CreateProductAsync(ProductCreateUpdateDto dto)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(dto.CategoryId);
        if (category == null)
            throw new KeyNotFoundException($"القسم المحدد ({dto.CategoryId}) غير موجود.");

        var keywords = !string.IsNullOrWhiteSpace(dto.SearchKeywords)
            ? dto.SearchKeywords.Trim()
            : await _keywordEnrichment.GenerateKeywordsForProductAsync(dto.Name, category.Title, useGoogleAutocomplete: true);

        bool isVerified = dto.IsVerifiedPhoto ?? (!string.IsNullOrWhiteSpace(dto.ImageUrl));
        var product = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = dto.CategoryId,
            Name = dto.Name.Trim(),
            Barcode = dto.Barcode?.Trim(),
            SearchKeywords = keywords,
            ImageUrl = dto.ImageUrl?.Trim(),
            TikTokVideoId = dto.TikTokVideoId?.Trim(),
            Price = dto.Price,
            OldPrice = dto.OldPrice,
            SortOrder = dto.SortOrder,
            StockQuantity = dto.StockQuantity,
            IsActive = dto.IsActive,
            IsVerifiedPhoto = isVerified
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.CompleteAsync();

        return new ProductDto
        {
            Id = product.Id,
            CategoryId = product.CategoryId,
            CategoryTitle = category.Title,
            CategoryIcon = category.Icon,
            Name = product.Name,
            Barcode = product.Barcode,
            SearchKeywords = product.SearchKeywords,
            ImageUrl = product.ImageUrl,
            TikTokVideoId = product.TikTokVideoId,
            Price = product.Price,
            OldPrice = product.OldPrice,
            DiscountPercent = product.OldPrice.HasValue && product.OldPrice.Value > product.Price
                ? (int)Math.Round(((product.OldPrice.Value - product.Price) / product.OldPrice.Value) * 100)
                : null,
            SortOrder = product.SortOrder,
            StockQuantity = product.StockQuantity,
            IsActive = product.IsActive,
            IsVerifiedPhoto = product.IsVerifiedPhoto,
            AverageRating = 5.0,
            ReviewsCount = 0
        };
    }

    public async Task<ProductDto?> UpdateProductAsync(Guid id, ProductCreateUpdateDto dto)
    {
        var product = await _unitOfWork.Products.Query()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return null;

        if (product.CategoryId != dto.CategoryId)
        {
            var categoryExists = await _unitOfWork.Categories.Query().AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
                throw new KeyNotFoundException($"القسم المحدد ({dto.CategoryId}) غير موجود.");
            product.CategoryId = dto.CategoryId;
        }

        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);

        product.Name = dto.Name.Trim();
        product.ImageUrl = dto.ImageUrl?.Trim();
        product.TikTokVideoId = dto.TikTokVideoId?.Trim();
        product.Price = dto.Price;
        product.OldPrice = dto.OldPrice;
        product.SortOrder = dto.SortOrder;
        product.StockQuantity = dto.StockQuantity;
        product.IsActive = dto.IsActive;

        if (dto.Barcode != null)
        {
            product.Barcode = string.IsNullOrWhiteSpace(dto.Barcode) ? null : dto.Barcode.Trim();
        }

        if (dto.IsVerifiedPhoto.HasValue)
        {
            product.IsVerifiedPhoto = dto.IsVerifiedPhoto.Value;
        }

        if (dto.SearchKeywords != null)
        {
            product.SearchKeywords = string.IsNullOrWhiteSpace(dto.SearchKeywords)
                ? await _keywordEnrichment.GenerateKeywordsForProductAsync(product.Name, category?.Title, useGoogleAutocomplete: false)
                : dto.SearchKeywords.Trim();
        }
        else if (string.IsNullOrWhiteSpace(product.SearchKeywords))
        {
            product.SearchKeywords = await _keywordEnrichment.GenerateKeywordsForProductAsync(product.Name, category?.Title, useGoogleAutocomplete: false);
        }

        _unitOfWork.Products.Update(product);
        await _unitOfWork.CompleteAsync();

        return new ProductDto
        {
            Id = product.Id,
            CategoryId = product.CategoryId,
            CategoryTitle = category?.Title ?? string.Empty,
            CategoryIcon = category?.Icon,
            Name = product.Name,
            Barcode = product.Barcode,
            SearchKeywords = product.SearchKeywords,
            ImageUrl = product.ImageUrl,
            TikTokVideoId = product.TikTokVideoId,
            Price = product.Price,
            OldPrice = product.OldPrice,
            DiscountPercent = product.OldPrice.HasValue && product.OldPrice.Value > product.Price
                ? (int)Math.Round(((product.OldPrice.Value - product.Price) / product.OldPrice.Value) * 100)
                : null,
            SortOrder = product.SortOrder,
            StockQuantity = product.StockQuantity,
            IsActive = product.IsActive,
            IsVerifiedPhoto = product.IsVerifiedPhoto,
            AverageRating = 5.0,
            ReviewsCount = 0
        };
    }

    public async Task<bool> DeleteProductAsync(Guid id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null)
            return false;

        // Soft delete
        product.IsActive = false;
        _unitOfWork.Products.Update(product);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> DeleteProductImageAsync(Guid id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null)
            return false;

        if (!string.IsNullOrWhiteSpace(product.ImageUrl))
        {
            try
            {
                var imgUrl = product.ImageUrl.Trim();
                if (imgUrl.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase) ||
                    imgUrl.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
                {
                    var relativePath = imgUrl.TrimStart('/');
                    var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);
                    if (File.Exists(fullPath))
                    {
                        File.Delete(fullPath);
                    }
                }
            }
            catch
            {
                // Non-critical local file deletion error ignored
            }
        }

        product.ImageUrl = null;
        product.ImageFetchAttempted = false;
        _unitOfWork.Products.Update(product);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<int> BulkUpdateProductsAsync(List<BulkProductUpdateItemDto> items)
    {
        if (items == null || items.Count == 0)
            return 0;

        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var ids = items.Select(i => i.Id).ToList();
            var products = await _unitOfWork.Products.Query()
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

            int updatedCount = 0;
            foreach (var item in items)
            {
                var prod = products.FirstOrDefault(p => p.Id == item.Id);
                if (prod == null)
                    continue;

                if (!string.IsNullOrWhiteSpace(item.Name))
                    prod.Name = item.Name.Trim();

                if (item.Price.HasValue)
                    prod.Price = item.Price.Value;

                if (item.ClearOldPrice)
                    prod.OldPrice = null;
                else if (item.OldPrice.HasValue)
                    prod.OldPrice = item.OldPrice.Value;

                if (!string.IsNullOrWhiteSpace(item.CategoryId))
                    prod.CategoryId = item.CategoryId;

                if (item.ImageUrl != null)
                    prod.ImageUrl = item.ImageUrl;

                if (item.IsVerifiedPhoto.HasValue)
                    prod.IsVerifiedPhoto = item.IsVerifiedPhoto.Value;

                if (item.StockQuantity.HasValue)
                    prod.StockQuantity = item.StockQuantity.Value;

                if (item.IsActive.HasValue)
                    prod.IsActive = item.IsActive.Value;

                _unitOfWork.Products.Update(prod);
                updatedCount++;
            }

            await _unitOfWork.CompleteAsync();
            await transaction.CommitAsync();

            return updatedCount;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<int> QuickPatchProductsAsync(List<QuickProductPatchDto> items)
    {
        if (items == null || items.Count == 0)
            return 0;

        var ids = items.Select(i => i.Id).Distinct().ToList();
        var products = await _unitOfWork.Products.Query()
            .Where(p => ids.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        var requestedCategoryIds = items
            .Where(i => i.CategoryId != null)
            .Select(i => i.CategoryId!)
            .Distinct()
            .ToList();

        HashSet<string>? validCategories = null;
        if (requestedCategoryIds.Count > 0)
        {
            validCategories = (await _unitOfWork.Categories.Query()
                .Where(c => requestedCategoryIds.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync())
                .ToHashSet();
        }

        int updatedCount = 0;
        var now = DateTime.UtcNow;

        foreach (var item in items)
        {
            if (!products.TryGetValue(item.Id, out var prod))
                continue;

            bool modified = false;

            if (item.Name != null)
            {
                var trimmed = item.Name.Trim();
                if (!string.IsNullOrEmpty(trimmed))
                {
                    prod.Name = trimmed.Length > 300 ? trimmed[..300] : trimmed;
                    modified = true;
                }
            }

            if (item.Price.HasValue && item.Price.Value >= 0)
            {
                prod.Price = item.Price.Value;
                modified = true;
            }

            if (item.DiscountPercent.HasValue)
            {
                if (item.DiscountPercent.Value <= 0)
                {
                    prod.OldPrice = null;
                    modified = true;
                }
                else if (item.DiscountPercent.Value < 100 && prod.Price > 0)
                {
                    prod.OldPrice = Math.Round(prod.Price / (1m - (item.DiscountPercent.Value / 100m)), 2);
                    modified = true;
                }
            }

            if (item.CategoryId != null && validCategories != null && validCategories.Contains(item.CategoryId))
            {
                prod.CategoryId = item.CategoryId;
                modified = true;
            }

            if (item.ImageUrl != null)
            {
                prod.ImageUrl = string.IsNullOrWhiteSpace(item.ImageUrl) ? null : item.ImageUrl.Trim();
                modified = true;
                if (!string.IsNullOrWhiteSpace(item.ImageUrl))
                {
                    prod.IsVerifiedPhoto = true;
                }
            }

            if (item.IsVerifiedPhoto.HasValue)
            {
                prod.IsVerifiedPhoto = item.IsVerifiedPhoto.Value;
                modified = true;
            }

            if (modified)
            {
                prod.UpdatedAt = now;
                _unitOfWork.Products.Update(prod);
                updatedCount++;
            }
        }

        if (updatedCount > 0)
        {
            await _unitOfWork.CompleteAsync();
        }

        return updatedCount;
    }
}
