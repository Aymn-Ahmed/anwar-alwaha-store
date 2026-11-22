using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Services;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/services")]
[Authorize(Roles = "Admin")]
public class AdminServicesController : ControllerBase
{
    private readonly IServiceCatalogService _serviceCatalog;

    public AdminServicesController(IServiceCatalogService serviceCatalog)
    {
        _serviceCatalog = serviceCatalog;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ServiceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var services = await _serviceCatalog.GetAllServicesAsync(activeOnly: false);
        return Ok(ApiResponse<List<ServiceDto>>.Ok(services));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ServiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var service = await _serviceCatalog.GetServiceByIdAsync(id);
        if (service == null)
            return NotFound(ApiResponse<object>.Fail("الخدمة غير موجودة."));

        return Ok(ApiResponse<ServiceDto>.Ok(service));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ServiceDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] ServiceCreateUpdateDto dto)
    {
        var created = await _serviceCatalog.CreateServiceAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<ServiceDto>.Ok(created, "تمت إضافة الخدمة بنجاح."));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ServiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] ServiceCreateUpdateDto dto)
    {
        var updated = await _serviceCatalog.UpdateServiceAsync(id, dto);
        if (updated == null)
            return NotFound(ApiResponse<object>.Fail("الخدمة غير موجودة."));

        return Ok(ApiResponse<ServiceDto>.Ok(updated, "تم تحديث الخدمة بنجاح."));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _serviceCatalog.DeleteServiceAsync(id);
        if (!deleted)
            return NotFound(ApiResponse<object>.Fail("الخدمة غير موجودة."));

        return Ok(ApiResponse.Ok("تم حذف الخدمة بنجاح."));
    }
}
