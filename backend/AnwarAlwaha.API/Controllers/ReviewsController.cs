using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Reviews;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitReview([FromBody] CreateReviewDto dto)
    {
        try
        {
            var review = await _reviewService.SubmitReviewAsync(dto);
            return Created(string.Empty, ApiResponse<ReviewDto>.Ok(review, "شكراً لتقييمك! تم نشر تقييمك كمشتري موثّق."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpGet("product/{productId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<List<ReviewDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProductReviews(Guid productId)
    {
        var reviews = await _reviewService.GetApprovedProductReviewsAsync(productId);
        return Ok(ApiResponse<List<ReviewDto>>.Ok(reviews));
    }
}
