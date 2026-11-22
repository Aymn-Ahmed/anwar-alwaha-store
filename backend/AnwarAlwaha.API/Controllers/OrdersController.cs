using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Orders;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<OrderResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var order = await _orderService.CreateOrderAsync(dto);
        return CreatedAtAction(
            nameof(GetByCode),
            new { orderCode = order.OrderCode },
            ApiResponse<OrderResponseDto>.Ok(order, "تم استلام طلبك بنجاح.")
        );
    }

    [HttpGet("{orderCode}")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string orderCode, [FromQuery] string? phoneLast4)
    {
        if (string.IsNullOrWhiteSpace(phoneLast4) || phoneLast4.Trim().Length < 4)
        {
            return BadRequest(ApiResponse<object>.Fail("يجب تزويد آخر 4 أرقام من رقم الجوال المسجل للتحقق من هوية صاحب الطلب."));
        }

        try
        {
            var order = await _orderService.GetOrderByCodeAsync(orderCode, phoneLast4);
            if (order == null)
            {
                return NotFound(ApiResponse<object>.Fail("لم يتم العثور على طلب بهذا الرمز."));
            }

            return Ok(ApiResponse<OrderResponseDto>.Ok(order));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpGet("by-phone")]
    [ProducesResponseType(typeof(ApiResponse<List<OrderResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByPhone([FromQuery] string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Trim().Length < 8)
        {
            return BadRequest(ApiResponse<object>.Fail("يرجى إدخال رقم جوال سعودي صحيح لعرض سجل الطلبات."));
        }

        var orders = await _orderService.GetOrdersByPhoneAsync(phone);
        return Ok(ApiResponse<List<OrderResponseDto>>.Ok(orders));
    }
}
