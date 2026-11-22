using AnwarAlwaha.API.DTOs.Bundles;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BundlesController : ControllerBase
{
    private readonly IBundleService _bundleService;

    public BundlesController(IBundleService bundleService)
    {
        _bundleService = bundleService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<BundleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var bundles = await _bundleService.GetAllBundlesAsync(activeOnly: true);
        return Ok(ApiResponse<List<BundleDto>>.Ok(bundles));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BundleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var bundle = await _bundleService.GetBundleByIdAsync(id);
        if (bundle == null || !bundle.IsActive)
            return NotFound(ApiResponse<object>.Fail("الباقة غير موجودة أو غير مفعلة."));

        return Ok(ApiResponse<BundleDto>.Ok(bundle));
    }
}
