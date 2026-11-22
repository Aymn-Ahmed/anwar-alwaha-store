using AnwarAlwaha.API.DTOs.Categories;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public AdminCategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllCategoriesAsync(includeInactive: true);
        return Ok(ApiResponse<List<CategoryDto>>.Ok(categories));
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null)
            return NotFound(ApiResponse<object>.Fail("القسم غير موجود."));

        return Ok(ApiResponse<CategoryDto>.Ok(category));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CategoryCreateUpdateDto dto)
    {
        var category = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, ApiResponse<CategoryDto>.Ok(category, "تم إنشاء القسم بنجاح."));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string id, [FromBody] CategoryCreateUpdateDto dto)
    {
        var updated = await _categoryService.UpdateCategoryAsync(id, dto);
        if (updated == null)
            return NotFound(ApiResponse<object>.Fail("القسم غير موجود."));

        return Ok(ApiResponse<CategoryDto>.Ok(updated, "تم تحديث القسم بنجاح."));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        var success = await _categoryService.DeleteCategoryAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("القسم غير موجود."));

        return Ok(ApiResponse.Ok("تم حذف/تعطيل القسم بنجاح."));
    }

    [HttpPost("transfer-products")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TransferProducts([FromBody] CategoryTransferRequestDto dto)
    {
        int count = await _categoryService.TransferProductsAsync(dto);
        return Ok(ApiResponse<int>.Ok(count, $"تم نقل {count} منتج إلى القسم بنجاح."));
    }

    [HttpPatch("reorder")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reorder([FromBody] List<CategoryReorderItemDto> items)
    {
        int count = await _categoryService.ReorderCategoriesAsync(items);
        return Ok(ApiResponse<int>.Ok(count, "تم حفظ ترتيب الأقسام بنجاح."));
    }
}
