using AnwarAlwaha.API.DTOs.Categories;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllCategoriesAsync(includeInactive: false);
        return Ok(ApiResponse<List<CategoryDto>>.Ok(categories));
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null || !category.IsActive)
            return NotFound(ApiResponse<object>.Fail("القسم غير موجود."));

        return Ok(ApiResponse<CategoryDto>.Ok(category));
    }
}
