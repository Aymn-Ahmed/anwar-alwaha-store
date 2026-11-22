using AnwarAlwaha.API.DTOs.Dashboard;
using AnwarAlwaha.API.DTOs.Orders;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var totalOrders = await _unitOfWork.Orders.Query().CountAsync();
        var pendingOrders = await _unitOfWork.Orders.Query()
            .CountAsync(o => o.Status.ToLower() == "pending");

        // Delivered or all non-cancelled orders total sales
        var totalSales = await _unitOfWork.Orders.Query()
            .Where(o => o.Status.ToLower() != "cancelled")
            .SumAsync(o => o.TotalAmount);

        var lowStockCount = await _unitOfWork.Products.Query()
            .CountAsync(p => p.IsActive && p.StockQuantity <= 5);

        var totalProducts = await _unitOfWork.Products.Query()
            .CountAsync(p => p.IsActive);

        var totalCategories = await _unitOfWork.Categories.Query()
            .CountAsync(c => c.IsActive);

        var recentOrders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new OrderAdminListDto
            {
                Id = o.Id,
                OrderCode = o.OrderCode,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                DeliveryMethod = o.DeliveryMethod,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                ItemsCount = o.Items.Count,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalOrders = totalOrders,
            TotalSales = totalSales,
            PendingOrders = pendingOrders,
            LowStockProductsCount = lowStockCount,
            TotalProducts = totalProducts,
            TotalCategories = totalCategories,
            RecentOrders = recentOrders
        };
    }
}
