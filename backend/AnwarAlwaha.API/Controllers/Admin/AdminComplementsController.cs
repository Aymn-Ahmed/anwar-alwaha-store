using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Complements;
using AnwarAlwaha.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/complements")]
[Authorize(Roles = "Admin")]
public class AdminComplementsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminComplementsController(AppDbContext db)
    {
        _db = db;
    }

    // ==================== 1. MUTUAL GROUPS ====================

    [HttpGet("groups")]
    [ProducesResponseType(typeof(ApiResponse<List<ComplementGroupDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGroups(CancellationToken ct)
    {
        var groups = await _db.ComplementGroups
            .AsNoTracking()
            .Include(g => g.Items)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync(ct);

        var allProdIds = groups.SelectMany(g => g.Items.Select(i => i.ProductId)).Distinct().ToList();
        var prodMap = await _db.Products
            .AsNoTracking()
            .Where(p => allProdIds.Contains(p.Id))
            .Select(p => new ComplementGroupProductDto
            {
                ProductId = p.Id,
                Name = p.Name,
                ImageUrl = p.ImageUrl,
                Price = p.Price,
                CategoryId = p.CategoryId
            })
            .ToDictionaryAsync(p => p.ProductId, ct);

        var result = groups.Select(g => new ComplementGroupDto
        {
            Id = g.Id,
            Title = g.Title,
            IsActive = g.IsActive,
            Products = g.Items
                .Where(i => prodMap.ContainsKey(i.ProductId))
                .Select(i => prodMap[i.ProductId])
                .ToList()
        }).ToList();

        return Ok(ApiResponse<List<ComplementGroupDto>>.Ok(result));
    }

    [HttpPost("groups")]
    [ProducesResponseType(typeof(ApiResponse<ComplementGroupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateGroup([FromBody] ComplementGroupCreateUpdateDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(ApiResponse<object>.Fail("عنوان المجموعة مطلوب."));

        var distinctIds = (dto.ProductIds ?? new List<Guid>()).Distinct().ToList();

        var group = new ComplementGroup
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            IsActive = dto.IsActive,
            Items = distinctIds.Select(pid => new ComplementGroupItem
            {
                Id = Guid.NewGuid(),
                ProductId = pid
            }).ToList()
        };

        _db.ComplementGroups.Add(group);
        await _db.SaveChangesAsync(ct);

        var products = await _db.Products
            .AsNoTracking()
            .Where(p => distinctIds.Contains(p.Id))
            .Select(p => new ComplementGroupProductDto
            {
                ProductId = p.Id,
                Name = p.Name,
                ImageUrl = p.ImageUrl,
                Price = p.Price,
                CategoryId = p.CategoryId
            })
            .ToListAsync(ct);

        var createdDto = new ComplementGroupDto
        {
            Id = group.Id,
            Title = group.Title,
            IsActive = group.IsActive,
            Products = products
        };

        return Ok(ApiResponse<ComplementGroupDto>.Ok(createdDto, "تم إنشاء مجموعة الترابط بنجاح."));
    }

    [HttpPut("groups/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ComplementGroupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateGroup(Guid id, [FromBody] ComplementGroupCreateUpdateDto dto, CancellationToken ct)
    {
        var group = await _db.ComplementGroups
            .Include(g => g.Items)
            .FirstOrDefaultAsync(g => g.Id == id, ct);

        if (group == null)
            return NotFound(ApiResponse<object>.Fail("المجموعة غير موجودة."));

        group.Title = string.IsNullOrWhiteSpace(dto.Title) ? group.Title : dto.Title.Trim();
        group.IsActive = dto.IsActive;
        group.UpdatedAt = DateTime.UtcNow;

        _db.ComplementGroupItems.RemoveRange(group.Items);

        var distinctIds = (dto.ProductIds ?? new List<Guid>()).Distinct().ToList();
        var newItems = distinctIds.Select(pid => new ComplementGroupItem
        {
            Id = Guid.NewGuid(),
            GroupId = group.Id,
            ProductId = pid
        }).ToList();

        _db.ComplementGroupItems.AddRange(newItems);
        await _db.SaveChangesAsync(ct);

        var products = await _db.Products
            .AsNoTracking()
            .Where(p => distinctIds.Contains(p.Id))
            .Select(p => new ComplementGroupProductDto
            {
                ProductId = p.Id,
                Name = p.Name,
                ImageUrl = p.ImageUrl,
                Price = p.Price,
                CategoryId = p.CategoryId
            })
            .ToListAsync(ct);

        return Ok(ApiResponse<ComplementGroupDto>.Ok(new ComplementGroupDto
        {
            Id = group.Id,
            Title = group.Title,
            IsActive = group.IsActive,
            Products = products
        }, "تم تحديث المجموعة بنجاح."));
    }

    [HttpDelete("groups/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteGroup(Guid id, CancellationToken ct)
    {
        var group = await _db.ComplementGroups.FirstOrDefaultAsync(g => g.Id == id, ct);
        if (group == null)
            return NotFound(ApiResponse<object>.Fail("المجموعة غير موجودة."));

        _db.ComplementGroups.Remove(group);
        await _db.SaveChangesAsync(ct);
        return Ok(ApiResponse.Ok("تم حذف المجموعة بنجاح."));
    }

    // ==================== 2. CATEGORY COMPLEMENT RULES ====================

    [HttpGet("category-rules")]
    [ProducesResponseType(typeof(ApiResponse<List<CategoryComplementRuleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategoryRules(CancellationToken ct)
    {
        var catMap = await _db.Categories
            .AsNoTracking()
            .Select(c => new { c.Id, c.Title })
            .ToDictionaryAsync(c => c.Id, c => c.Title, ct);

        var rules = await _db.CategoryComplementRules
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        var dtos = rules.Select(r => new CategoryComplementRuleDto
        {
            Id = r.Id,
            SourceCategoryId = r.SourceCategoryId,
            SourceCategoryTitle = catMap.TryGetValue(r.SourceCategoryId, out var st) ? st : r.SourceCategoryId,
            TargetCategoryId = r.TargetCategoryId,
            TargetCategoryTitle = catMap.TryGetValue(r.TargetCategoryId, out var tt) ? tt : r.TargetCategoryId,
            IsActive = r.IsActive
        }).ToList();

        return Ok(ApiResponse<List<CategoryComplementRuleDto>>.Ok(dtos));
    }

    [HttpPost("category-rules")]
    [ProducesResponseType(typeof(ApiResponse<CategoryComplementRuleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateCategoryRule([FromBody] CategoryComplementRuleCreateDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.SourceCategoryId) || string.IsNullOrWhiteSpace(dto.TargetCategoryId))
            return BadRequest(ApiResponse<object>.Fail("يرجى اختيار القسم المصدر والقسم المقترح."));

        if (dto.SourceCategoryId == dto.TargetCategoryId)
            return BadRequest(ApiResponse<object>.Fail("يجب أن يكون القسم المقترح مختلفاً عن القسم المصدر."));

        var existing = await _db.CategoryComplementRules
            .FirstOrDefaultAsync(r => r.SourceCategoryId == dto.SourceCategoryId && r.TargetCategoryId == dto.TargetCategoryId, ct);

        if (existing != null)
        {
            existing.IsActive = dto.IsActive;
            await _db.SaveChangesAsync(ct);
        }
        else
        {
            existing = new CategoryComplementRule
            {
                Id = Guid.NewGuid(),
                SourceCategoryId = dto.SourceCategoryId,
                TargetCategoryId = dto.TargetCategoryId,
                IsActive = dto.IsActive
            };
            _db.CategoryComplementRules.Add(existing);
            await _db.SaveChangesAsync(ct);
        }

        var catMap = await _db.Categories
            .AsNoTracking()
            .Select(c => new { c.Id, c.Title })
            .ToDictionaryAsync(c => c.Id, c => c.Title, ct);

        return Ok(ApiResponse<CategoryComplementRuleDto>.Ok(new CategoryComplementRuleDto
        {
            Id = existing.Id,
            SourceCategoryId = existing.SourceCategoryId,
            SourceCategoryTitle = catMap.TryGetValue(existing.SourceCategoryId, out var st) ? st : existing.SourceCategoryId,
            TargetCategoryId = existing.TargetCategoryId,
            TargetCategoryTitle = catMap.TryGetValue(existing.TargetCategoryId, out var tt) ? tt : existing.TargetCategoryId,
            IsActive = existing.IsActive
        }, "تم حفظ قاعدة ربط الأقسام بنجاح."));
    }

    [HttpDelete("category-rules/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteCategoryRule(Guid id, CancellationToken ct)
    {
        var rule = await _db.CategoryComplementRules.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (rule == null)
            return NotFound(ApiResponse<object>.Fail("القاعدة غير موجودة."));

        _db.CategoryComplementRules.Remove(rule);
        await _db.SaveChangesAsync(ct);
        return Ok(ApiResponse.Ok("تم حذف قاعدة الربط بنجاح."));
    }
}
