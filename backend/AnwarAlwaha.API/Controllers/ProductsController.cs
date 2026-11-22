using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Products;
using AnwarAlwaha.API.DTOs.Reviews;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IReviewService _reviewService;

    public ProductsController(IProductService productService, IReviewService reviewService)
    {
        _productService = productService;
        _reviewService = reviewService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ProductDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts([FromQuery] ProductQueryParamsDto query)
    {
        var result = await _productService.GetProductsPagedAsync(query, adminView: false);
        return Ok(ApiResponse<PagedResult<ProductDto>>.Ok(result));
    }

    [HttpGet("{idOrSlug}")]
    [ProducesResponseType(typeof(ApiResponse<ProductDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string idOrSlug)
    {
        var product = await _productService.GetProductByIdOrSlugAsync(idOrSlug, includeDetails: true);
        if (product == null)
            return NotFound(ApiResponse<object>.Fail("المنتج غير موجود."));

        return Ok(ApiResponse<ProductDetailDto>.Ok(product));
    }

    [HttpGet("by-slug/{slug}")]
    [ProducesResponseType(typeof(ApiResponse<ProductDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var product = await _productService.GetProductByIdOrSlugAsync(slug, includeDetails: true);
        if (product == null)
            return NotFound(ApiResponse<object>.Fail("المنتج غير موجود."));

        return Ok(ApiResponse<ProductDetailDto>.Ok(product));
    }

    [HttpGet("{productId:guid}/reviews")]
    [ProducesResponseType(typeof(ApiResponse<List<ReviewDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProductReviews(Guid productId)
    {
        var reviews = await _reviewService.GetApprovedProductReviewsAsync(productId);
        return Ok(ApiResponse<List<ReviewDto>>.Ok(reviews));
    }

    [HttpPost("{productId:guid}/reviews")]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitProductReview(Guid productId, [FromBody] CreateReviewDto dto)
    {
        dto.ProductId = productId;
        try
        {
            var review = await _reviewService.SubmitReviewAsync(dto);
            return Ok(ApiResponse<ReviewDto>.Ok(review, "شكراً لتقييمك! تم حفظ ونشر تقييمك كمشتري موثّق."));
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
}
