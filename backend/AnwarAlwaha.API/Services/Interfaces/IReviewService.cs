using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Reviews;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> SubmitReviewAsync(CreateReviewDto dto);
    Task<List<ReviewDto>> GetApprovedProductReviewsAsync(Guid productId);
    Task<PagedResult<ReviewDto>> GetAllReviewsAdminAsync(int page, int pageSize, bool? isApproved = null);
    Task<bool> ApproveReviewAsync(Guid id);
    Task<bool> DeleteReviewAsync(Guid id);
}
