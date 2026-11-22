using AnwarAlwaha.API.DTOs.Orders;

namespace AnwarAlwaha.API.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalOrders { get; set; }
    public decimal TotalSales { get; set; }
    public int PendingOrders { get; set; }
    public int LowStockProductsCount { get; set; }
    public int TotalProducts { get; set; }
    public int TotalCategories { get; set; }
    public List<OrderAdminListDto> RecentOrders { get; set; } = new();
}
