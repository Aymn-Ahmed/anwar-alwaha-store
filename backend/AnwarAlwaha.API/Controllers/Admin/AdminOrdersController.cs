using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Orders;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<OrderAdminListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _orderService.GetOrdersPagedAsync(status, page, pageSize);
        return Ok(ApiResponse<PagedResult<OrderAdminListDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _orderService.GetOrderByIdAdminAsync(id);
        if (order == null)
            return NotFound(ApiResponse<object>.Fail("الطلب غير موجود."));

        return Ok(ApiResponse<OrderResponseDto>.Ok(order));
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatusUpdateDto dto)
    {
        var updated = await _orderService.UpdateOrderStatusAsync(id, dto);
        if (updated == null)
            return NotFound(ApiResponse<object>.Fail("الطلب غير موجود."));

        return Ok(ApiResponse<OrderResponseDto>.Ok(updated, "تم تحديث حالة الطلب بنجاح."));
    }
}
