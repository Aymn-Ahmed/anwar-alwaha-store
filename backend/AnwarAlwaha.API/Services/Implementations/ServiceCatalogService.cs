using AnwarAlwaha.API.DTOs.Services;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly IUnitOfWork _unitOfWork;

    public ServiceCatalogService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ServiceDto>> GetAllServicesAsync(bool activeOnly = true)
    {
        var query = _unitOfWork.Services.Query().Include(s => s.LinkedCategory).AsQueryable();

        if (activeOnly)
        {
            query = query.Where(s => s.IsActive);
        }

        return await query
            .OrderBy(s => s.SortOrder)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Title = s.Title,
                Description = s.Description,
                IconName = s.IconName,
                AccentColor = s.AccentColor,
                MediaType = s.MediaType,
                MediaUrl = s.MediaUrl,
                LinkedCategoryId = s.LinkedCategoryId,
                LinkedCategoryTitle = s.LinkedCategory != null ? s.LinkedCategory.Title : null,
                WhatsAppTemplate = s.WhatsAppTemplate,
                DetailedOverview = s.DetailedOverview,
                AvailableOptionsOrSizes = s.AvailableOptionsOrSizes,
                GalleryImageUrls = s.GalleryImageUrls,
                SortOrder = s.SortOrder,
                IsActive = s.IsActive
            })
            .ToListAsync();
    }

    public async Task<ServiceDto?> GetServiceByIdAsync(Guid id)
    {
        var service = await _unitOfWork.Services.Query()
            .Include(s => s.LinkedCategory)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return null;

        return new ServiceDto
        {
            Id = service.Id,
            Title = service.Title,
            Description = service.Description,
            IconName = service.IconName,
            AccentColor = service.AccentColor,
            MediaType = service.MediaType,
            MediaUrl = service.MediaUrl,
            LinkedCategoryId = service.LinkedCategoryId,
            LinkedCategoryTitle = service.LinkedCategory?.Title,
            WhatsAppTemplate = service.WhatsAppTemplate,
            DetailedOverview = service.DetailedOverview,
            AvailableOptionsOrSizes = service.AvailableOptionsOrSizes,
            GalleryImageUrls = service.GalleryImageUrls,
            SortOrder = service.SortOrder,
            IsActive = service.IsActive
        };
    }

    public async Task<ServiceDto?> GetServiceByIdOrSlugAsync(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier))
            return null;

        var query = _unitOfWork.Services.Query().Include(s => s.LinkedCategory).AsQueryable();

        if (Guid.TryParse(identifier, out var guid))
        {
            var byGuid = await query.FirstOrDefaultAsync(s => s.Id == guid);
            if (byGuid != null)
                return MapToDto(byGuid);
        }

        var trimmed = identifier.Trim().ToLower();
        var service = await query.FirstOrDefaultAsync(s =>
            (s.LinkedCategoryId != null && s.LinkedCategoryId.ToLower() == trimmed) ||
            s.Title.ToLower() == trimmed ||
            s.Id.ToString() == trimmed);

        return service != null ? MapToDto(service) : null;
    }

    private static ServiceDto MapToDto(ServiceItem service) => new ServiceDto
    {
        Id = service.Id,
        Title = service.Title,
        Description = service.Description,
        IconName = service.IconName,
        AccentColor = service.AccentColor,
        MediaType = service.MediaType,
        MediaUrl = service.MediaUrl,
        LinkedCategoryId = service.LinkedCategoryId,
        LinkedCategoryTitle = service.LinkedCategory?.Title,
        WhatsAppTemplate = service.WhatsAppTemplate,
        DetailedOverview = service.DetailedOverview,
        AvailableOptionsOrSizes = service.AvailableOptionsOrSizes,
        GalleryImageUrls = service.GalleryImageUrls,
        SortOrder = service.SortOrder,
        IsActive = service.IsActive
    };

    public async Task<ServiceDto> CreateServiceAsync(ServiceCreateUpdateDto dto)
    {
        var service = new ServiceItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            IconName = string.IsNullOrWhiteSpace(dto.IconName) ? "sparkles" : dto.IconName.Trim(),
            AccentColor = string.IsNullOrWhiteSpace(dto.AccentColor) ? "#0284c7" : dto.AccentColor.Trim(),
            MediaType = string.IsNullOrWhiteSpace(dto.MediaType) ? "none" : dto.MediaType.Trim(),
            MediaUrl = dto.MediaUrl?.Trim(),
            LinkedCategoryId = dto.LinkedCategoryId,
            WhatsAppTemplate = dto.WhatsAppTemplate?.Trim(),
            DetailedOverview = dto.DetailedOverview?.Trim(),
            AvailableOptionsOrSizes = dto.AvailableOptionsOrSizes?.Trim(),
            GalleryImageUrls = dto.GalleryImageUrls?.Trim(),
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive
        };

        await _unitOfWork.Services.AddAsync(service);
        await _unitOfWork.CompleteAsync();

        return new ServiceDto
        {
            Id = service.Id,
            Title = service.Title,
            Description = service.Description,
            IconName = service.IconName,
            AccentColor = service.AccentColor,
            MediaType = service.MediaType,
            MediaUrl = service.MediaUrl,
            LinkedCategoryId = service.LinkedCategoryId,
            WhatsAppTemplate = service.WhatsAppTemplate,
            DetailedOverview = service.DetailedOverview,
            AvailableOptionsOrSizes = service.AvailableOptionsOrSizes,
            GalleryImageUrls = service.GalleryImageUrls,
            SortOrder = service.SortOrder,
            IsActive = service.IsActive
        };
    }

    public async Task<ServiceDto?> UpdateServiceAsync(Guid id, ServiceCreateUpdateDto dto)
    {
        var service = await _unitOfWork.Services.GetByIdAsync(id);
        if (service == null)
            return null;

        service.Title = dto.Title.Trim();
        service.Description = dto.Description.Trim();
        service.IconName = string.IsNullOrWhiteSpace(dto.IconName) ? service.IconName : dto.IconName.Trim();
        service.AccentColor = string.IsNullOrWhiteSpace(dto.AccentColor) ? service.AccentColor : dto.AccentColor.Trim();
        service.MediaType = string.IsNullOrWhiteSpace(dto.MediaType) ? service.MediaType : dto.MediaType.Trim();
        service.MediaUrl = dto.MediaUrl?.Trim();
        service.LinkedCategoryId = dto.LinkedCategoryId;
        service.WhatsAppTemplate = dto.WhatsAppTemplate?.Trim();
        service.DetailedOverview = dto.DetailedOverview?.Trim();
        service.AvailableOptionsOrSizes = dto.AvailableOptionsOrSizes?.Trim();
        service.GalleryImageUrls = dto.GalleryImageUrls?.Trim();
        service.SortOrder = dto.SortOrder;
        service.IsActive = dto.IsActive;

        _unitOfWork.Services.Update(service);
        await _unitOfWork.CompleteAsync();

        return new ServiceDto
        {
            Id = service.Id,
            Title = service.Title,
            Description = service.Description,
            IconName = service.IconName,
            AccentColor = service.AccentColor,
            MediaType = service.MediaType,
            MediaUrl = service.MediaUrl,
            LinkedCategoryId = service.LinkedCategoryId,
            WhatsAppTemplate = service.WhatsAppTemplate,
            DetailedOverview = service.DetailedOverview,
            AvailableOptionsOrSizes = service.AvailableOptionsOrSizes,
            GalleryImageUrls = service.GalleryImageUrls,
            SortOrder = service.SortOrder,
            IsActive = service.IsActive
        };
    }

    public async Task<bool> DeleteServiceAsync(Guid id)
    {
        var service = await _unitOfWork.Services.GetByIdAsync(id);
        if (service == null)
            return false;

        _unitOfWork.Services.Remove(service);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
