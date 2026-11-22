using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Products;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IPosImportService _posImportService;
    private readonly IBarcodeImageFetcherService _barcodeImageFetcher;
    private readonly IProductKeywordEnrichmentService _keywordEnrichment;

    public AdminProductsController(
        IProductService productService,
        IPosImportService posImportService,
        IBarcodeImageFetcherService barcodeImageFetcher,
        IProductKeywordEnrichmentService keywordEnrichment)
    {
        _productService = productService;
        _posImportService = posImportService;
        _barcodeImageFetcher = barcodeImageFetcher;
        _keywordEnrichment = keywordEnrichment;
    }

    [HttpGet("keywords/status")]
    [ProducesResponseType(typeof(ApiResponse<KeywordEnrichmentStatusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKeywordsStatus(CancellationToken ct)
    {
        var status = await _keywordEnrichment.GetStatusAsync(ct);
        return Ok(ApiResponse<KeywordEnrichmentStatusDto>.Ok(status));
    }

    [HttpPost("keywords/start")]
    [ProducesResponseType(typeof(ApiResponse<KeywordEnrichmentStatusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> StartKeywordsEnrichment(CancellationToken ct)
    {
        var status = await _keywordEnrichment.StartBackgroundEnrichmentAsync(ct);
        return Ok(ApiResponse<KeywordEnrichmentStatusDto>.Ok(status, "بدأ توليد الكلمات المفتاحية ومرادفات البحث في الخلفية."));
    }

    [HttpPost("keywords/stop")]
    [ProducesResponseType(typeof(ApiResponse<KeywordEnrichmentStatusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> StopKeywordsEnrichment(CancellationToken ct)
    {
        var status = await _keywordEnrichment.StopBackgroundEnrichmentAsync(ct);
        return Ok(ApiResponse<KeywordEnrichmentStatusDto>.Ok(status, "تم إرسال أمر إيقاف توليد الكلمات المفتاحية."));
    }

    [HttpGet("barcode-images/stats")]
    [ProducesResponseType(typeof(ApiResponse<BarcodeImageStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBarcodeImageStats(CancellationToken ct)
    {
        var stats = await _barcodeImageFetcher.GetStatsAsync(ct);
        return Ok(ApiResponse<BarcodeImageStatsDto>.Ok(stats));
    }

    [HttpPost("barcode-images/start")]
    [ProducesResponseType(typeof(ApiResponse<BarcodeImageStatsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> StartBarcodeImagesFetch(
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] StartImageFetchRequestDto? request = null,
        [FromQuery] string? apiKey = null,
        CancellationToken ct = default)
    {
        string? effectiveApiKey = !string.IsNullOrWhiteSpace(request?.ApiKey) ? request!.ApiKey : apiKey;
        int batchSize = request?.BatchSize ?? 25;

        try
        {
            var stats = await _barcodeImageFetcher.StartBackgroundFetchAsync(effectiveApiKey, batchSize, ct);
            return Ok(ApiResponse<BarcodeImageStatsDto>.Ok(stats, "بدأ السحب الآلي للصور في الخلفية."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpPost("barcode-images/stop")]
    [ProducesResponseType(typeof(ApiResponse<BarcodeImageStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> StopBarcodeImagesFetch(CancellationToken ct)
    {
        var stats = await _barcodeImageFetcher.StopBackgroundFetchAsync(ct);
        return Ok(ApiResponse<BarcodeImageStatsDto>.Ok(stats, "تم إرسال أمر إيقاف السحب الخلفي."));
    }

    [HttpPost("barcode-images/fetch-batch")]
    [ProducesResponseType(typeof(ApiResponse<BarcodeImageBatchResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> FetchBarcodeImagesBatch(
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] FetchBatchRequestDto? request = null,
        [FromQuery] int? batchSize = null,
        [FromQuery] string? apiKey = null,
        CancellationToken ct = default)
    {
        int effectiveBatchSize = batchSize ?? request?.BatchSize ?? 25;
        string? effectiveApiKey = !string.IsNullOrWhiteSpace(request?.ApiKey) ? request!.ApiKey : apiKey;

        try
        {
            var result = await _barcodeImageFetcher.FetchBatchAsync(effectiveBatchSize, effectiveApiKey, ct);
            return Ok(ApiResponse<BarcodeImageBatchResultDto>.Ok(result, result.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpPost("barcode-images/reset-attempts")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetBarcodeImageAttempts(CancellationToken ct)
    {
        int resetCount = await _barcodeImageFetcher.ResetAttemptsAsync(ct);
        return Ok(ApiResponse<int>.Ok(resetCount, $"تمت إعادة تعيين {resetCount} صنف لإعادة البحث عن صورها."));
    }

    [HttpPost("preview-pos-csv")]
    [RequestSizeLimit(30_000_000)]
    [ProducesResponseType(typeof(ApiResponse<PosPreviewResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> PreviewPosCsv(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("يرجى اختيار ملف CSV صالح."));

        await using var stream = file.OpenReadStream();
        var result = await _posImportService.PreviewAsync(stream, ct);
        return Ok(ApiResponse<PosPreviewResultDto>.Ok(result));
    }

    [HttpPost("confirm-import")]
    [RequestSizeLimit(30_000_000)]
    [ProducesResponseType(typeof(ApiResponse<ImportSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ConfirmImport([FromBody] List<ImportProductDto> items, CancellationToken ct)
    {
        var summary = await _posImportService.ConfirmAsync(items, ct);
        return Ok(ApiResponse<ImportSummaryDto>.Ok(summary, $"تمت الإضافة: {summary.Added}، التحديث: {summary.Updated}"));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ProductDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts([FromQuery] ProductQueryParamsDto query)
    {
        var result = await _productService.GetProductsPagedAsync(query, adminView: true);
        return Ok(ApiResponse<PagedResult<ProductDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProductDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _productService.GetProductByIdAsync(id, includeDetails: true);
        if (product == null)
            return NotFound(ApiResponse<object>.Fail("المنتج غير موجود."));

        return Ok(ApiResponse<ProductDetailDto>.Ok(product));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] ProductCreateUpdateDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, ApiResponse<ProductDto>.Ok(product, "تم إضافة المنتج بنجاح."));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProductCreateUpdateDto dto)
    {
        var updated = await _productService.UpdateProductAsync(id, dto);
        if (updated == null)
            return NotFound(ApiResponse<object>.Fail("المنتج غير موجود."));

        return Ok(ApiResponse<ProductDto>.Ok(updated, "تم تحديث بيانات المنتج بنجاح."));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _productService.DeleteProductAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("المنتج غير موجود."));

        return Ok(ApiResponse.Ok("تم تعطيل/حذف المنتج بنجاح."));
    }

    [HttpDelete("{id:guid}/image")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteImage(Guid id)
    {
        var success = await _productService.DeleteProductImageAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("المنتج غير موجود."));

        return Ok(ApiResponse.Ok("تم حذف صورة المنتج بنجاح."));
    }

    [HttpPatch("bulk")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkUpdate([FromBody] List<BulkProductUpdateItemDto> items)
    {
        int updatedCount = await _productService.BulkUpdateProductsAsync(items);
        return Ok(ApiResponse<int>.Ok(updatedCount, $"تم تحديث {updatedCount} منتج بنجاح."));
    }

    [HttpPatch("quick-patch")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> QuickPatch([FromBody] List<QuickProductPatchDto> items)
    {
        int updatedCount = await _productService.QuickPatchProductsAsync(items);
        return Ok(ApiResponse<int>.Ok(updatedCount, $"تم حفظ تعديلات {updatedCount} صنف بنجاح."));
    }
}
