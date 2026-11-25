using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Services;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IServiceCatalogService _serviceCatalog;

    public ServicesController(IServiceCatalogService serviceCatalog)
    {
        _serviceCatalog = serviceCatalog;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ServiceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var services = await _serviceCatalog.GetAllServicesAsync(activeOnly: true);
        return Ok(ApiResponse<List<ServiceDto>>.Ok(services));
    }

    [HttpGet("{idOrSlug}")]
    [ProducesResponseType(typeof(ApiResponse<ServiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdOrSlug(string idOrSlug)
    {
        var service = await _serviceCatalog.GetServiceByIdOrSlugAsync(idOrSlug);
        if (service == null || !service.IsActive)
            return NotFound(ApiResponse<object>.Fail("الخدمة غير موجودة أو غير مفعلة."));

        return Ok(ApiResponse<ServiceDto>.Ok(service));
    }
}
