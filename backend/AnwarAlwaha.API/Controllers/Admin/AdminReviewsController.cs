using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Reviews;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/reviews")]
[Authorize(Roles = "Admin")]
public class AdminReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public AdminReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ReviewDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] bool? isApproved = null)
    {
        var result = await _reviewService.GetAllReviewsAdminAsync(page, pageSize, isApproved);
        return Ok(ApiResponse<PagedResult<ReviewDto>>.Ok(result));
    }

    [HttpPatch("{id:guid}/approve")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(Guid id)
    {
        var success = await _reviewService.ApproveReviewAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("التقييم غير موجود."));

        return Ok(ApiResponse.Ok("تمت الموافقة على التقييم ونشره بنجاح."));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _reviewService.DeleteReviewAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("التقييم غير موجود."));

        return Ok(ApiResponse.Ok("تم حذف التقييم بنجاح."));
    }
}
