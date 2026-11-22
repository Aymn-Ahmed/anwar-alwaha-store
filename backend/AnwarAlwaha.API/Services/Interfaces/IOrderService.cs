using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Orders;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto dto);
    Task<OrderResponseDto?> GetOrderByCodeAsync(string orderCode, string phoneLast4);
    Task<List<OrderResponseDto>> GetOrdersByPhoneAsync(string phone);
    Task<PagedResult<OrderAdminListDto>> GetOrdersPagedAsync(string? status, int page, int pageSize);
    Task<OrderResponseDto?> GetOrderByIdAdminAsync(Guid id);
    Task<OrderResponseDto?> UpdateOrderStatusAsync(Guid id, OrderStatusUpdateDto dto);
}
