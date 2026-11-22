using AnwarAlwaha.API.DTOs.Dashboard;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}
