using AnwarAlwaha.API.DTOs.Bundles;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/bundles")]
[Authorize(Roles = "Admin")]
public class AdminBundlesController : ControllerBase
{
    private readonly IBundleService _bundleService;

    public AdminBundlesController(IBundleService bundleService)
    {
        _bundleService = bundleService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<BundleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var bundles = await _bundleService.GetAllBundlesAsync(activeOnly: false);
        return Ok(ApiResponse<List<BundleDto>>.Ok(bundles));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BundleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var bundle = await _bundleService.GetBundleByIdAsync(id);
        if (bundle == null)
            return NotFound(ApiResponse<object>.Fail("الباقة غير موجودة."));

        return Ok(ApiResponse<BundleDto>.Ok(bundle));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BundleDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] BundleCreateUpdateDto dto)
    {
        var bundle = await _bundleService.CreateBundleAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = bundle.Id }, ApiResponse<BundleDto>.Ok(bundle, "تم إنشاء الباقة بنجاح."));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BundleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] BundleCreateUpdateDto dto)
    {
        var updated = await _bundleService.UpdateBundleAsync(id, dto);
        if (updated == null)
            return NotFound(ApiResponse<object>.Fail("الباقة غير موجودة."));

        return Ok(ApiResponse<BundleDto>.Ok(updated, "تم تحديث الباقة بنجاح."));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _bundleService.DeleteBundleAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("الباقة غير موجودة."));

        return Ok(ApiResponse.Ok("تم تعطيل/حذف الباقة بنجاح."));
    }
}
