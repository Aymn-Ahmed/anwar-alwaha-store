using AnwarAlwaha.API.Common;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Reviews;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class ReviewService : IReviewService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ReviewDto> SubmitReviewAsync(CreateReviewDto dto)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(dto.ProductId);
        if (product == null)
            throw new KeyNotFoundException("المنتج المطلوب غير موجود.");

        Order? matchedOrder = null;
        var core9 = SaudiPhoneNormalizer.ExtractCore9Digits(dto.CustomerPhone);

        if (!string.IsNullOrWhiteSpace(core9) && core9.Length >= 8)
        {
            var customerOrders = await _unitOfWork.Orders.Query()
                .Include(o => o.Items)
                .Where(o =>
                    o.CustomerPhone != null &&
                    o.CustomerPhone.Contains(core9) &&
                    o.Status.ToLower() != "cancelled" &&
                    o.Items.Any(i => i.ProductId == dto.ProductId))
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            matchedOrder = customerOrders.FirstOrDefault(o =>
                SaudiPhoneNormalizer.ArePhonesEquivalent(o.CustomerPhone, dto.CustomerPhone));
        }

        if (matchedOrder == null && !string.IsNullOrWhiteSpace(dto.OrderCode))
        {
            var byCode = await _unitOfWork.Orders.Query()
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o =>
                    o.OrderCode == dto.OrderCode.Trim() &&
                    o.Status.ToLower() != "cancelled" &&
                    o.Items.Any(i => i.ProductId == dto.ProductId));

            if (byCode != null)
            {
                if (string.IsNullOrWhiteSpace(dto.CustomerPhone) ||
                    SaudiPhoneNormalizer.ArePhonesEquivalent(byCode.CustomerPhone, dto.CustomerPhone))
                {
                    matchedOrder = byCode;
                }
            }
        }

        if (matchedOrder == null)
        {
            throw new InvalidOperationException("التقييم متاح فقط للعملاء الذين قاموا بشراء هذا المنتج مسبقاً");
        }

        // Prevent duplicate reviews for the same product from the same phone number (update existing review if present)
        var existingProductReviews = await _unitOfWork.Reviews.Query()
            .Include(r => r.Order)
            .Where(r => r.ProductId == dto.ProductId)
            .ToListAsync();

        var existingReview = existingProductReviews.FirstOrDefault(r =>
            (r.Order != null && SaudiPhoneNormalizer.ArePhonesEquivalent(r.Order.CustomerPhone, matchedOrder.CustomerPhone)) ||
            (!string.IsNullOrWhiteSpace(r.OrderCode) && r.OrderCode == matchedOrder.OrderCode));

        ProductReview savedReview;
        int safeRating = Math.Clamp(dto.Rating, 1, 5);
        string safeName = string.IsNullOrWhiteSpace(dto.CustomerName)
            ? matchedOrder.CustomerName
            : dto.CustomerName.Trim();

        if (existingReview != null)
        {
            existingReview.CustomerName = safeName;
            existingReview.Rating = safeRating;
            existingReview.Comment = dto.Comment?.Trim();
            existingReview.MediaUrls = dto.MediaUrls ?? Array.Empty<string>();
            existingReview.IsApproved = true;
            existingReview.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Reviews.Update(existingReview);
            savedReview = existingReview;
        }
        else
        {
            savedReview = new ProductReview
            {
                Id = Guid.NewGuid(),
                ProductId = dto.ProductId,
                OrderId = matchedOrder.Id,
                OrderCode = matchedOrder.OrderCode,
                CustomerName = safeName,
                Rating = safeRating,
                Comment = dto.Comment?.Trim(),
                MediaUrls = dto.MediaUrls ?? Array.Empty<string>(),
                IsApproved = true // Auto-approved because purchase is verified in DB
            };
            await _unitOfWork.Reviews.AddAsync(savedReview);
        }

        matchedOrder.IsReviewed = true;
        _unitOfWork.Orders.Update(matchedOrder);

        await _unitOfWork.CompleteAsync();

        // Compute updated average rating and count for this product
        var approvedRatings = await _unitOfWork.Reviews.Query()
            .Where(r => r.ProductId == dto.ProductId && r.IsApproved)
            .Select(r => r.Rating)
            .ToListAsync();

        int reviewsCount = approvedRatings.Count;
        double avgRating = reviewsCount > 0 ? Math.Round(approvedRatings.Average(), 1) : 5.0;

        return new ReviewDto
        {
            Id = savedReview.Id,
            ProductId = savedReview.ProductId,
            ProductName = product.Name,
            OrderCode = savedReview.OrderCode,
            CustomerName = savedReview.CustomerName,
            Rating = savedReview.Rating,
            Comment = savedReview.Comment,
            MediaUrls = savedReview.MediaUrls,
            IsApproved = savedReview.IsApproved,
            IsVerifiedPurchase = true,
            AverageRating = avgRating,
            ReviewsCount = reviewsCount,
            CreatedAt = savedReview.CreatedAt
        };
    }

    public async Task<List<ReviewDto>> GetApprovedProductReviewsAsync(Guid productId)
    {
        var list = await _unitOfWork.Reviews.Query()
            .Include(r => r.Product)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product != null ? r.Product.Name : string.Empty,
                OrderCode = r.OrderCode,
                CustomerName = r.CustomerName,
                Rating = r.Rating,
                Comment = r.Comment,
                MediaUrls = r.MediaUrls,
                IsApproved = r.IsApproved,
                IsVerifiedPurchase = true,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        int count = list.Count;
        double avg = count > 0 ? Math.Round(list.Average(r => r.Rating), 1) : 5.0;
        foreach (var item in list)
        {
            item.AverageRating = avg;
            item.ReviewsCount = count;
        }

        return list;
    }

    public async Task<PagedResult<ReviewDto>> GetAllReviewsAdminAsync(int page, int pageSize, bool? isApproved = null)
    {
        var query = _unitOfWork.Reviews.Query()
            .Include(r => r.Product)
            .AsQueryable();

        if (isApproved.HasValue)
        {
            query = query.Where(r => r.IsApproved == isApproved.Value);
        }

        int totalCount = await query.CountAsync();
        int safePage = Math.Max(1, page);
        int safePageSize = Math.Clamp(pageSize, 1, 100);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product != null ? r.Product.Name : string.Empty,
                OrderCode = r.OrderCode,
                CustomerName = r.CustomerName,
                Rating = r.Rating,
                Comment = r.Comment,
                MediaUrls = r.MediaUrls,
                IsApproved = r.IsApproved,
                IsVerifiedPurchase = true,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<ReviewDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = safePage,
            PageSize = safePageSize
        };
    }

    public async Task<bool> ApproveReviewAsync(Guid id)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id);
        if (review == null)
            return false;

        review.IsApproved = true;
        _unitOfWork.Reviews.Update(review);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> DeleteReviewAsync(Guid id)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id);
        if (review == null)
            return false;

        _unitOfWork.Reviews.Remove(review);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
