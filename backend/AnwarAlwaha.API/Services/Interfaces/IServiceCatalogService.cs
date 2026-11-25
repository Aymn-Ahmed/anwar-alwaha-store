using AnwarAlwaha.API.DTOs.Services;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IServiceCatalogService
{
    Task<List<ServiceDto>> GetAllServicesAsync(bool activeOnly = true);
    Task<ServiceDto?> GetServiceByIdAsync(Guid id);
    Task<ServiceDto?> GetServiceByIdOrSlugAsync(string identifier);
    Task<ServiceDto> CreateServiceAsync(ServiceCreateUpdateDto dto);
    Task<ServiceDto?> UpdateServiceAsync(Guid id, ServiceCreateUpdateDto dto);
    Task<bool> DeleteServiceAsync(Guid id);
}
