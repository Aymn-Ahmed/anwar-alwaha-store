using System.Security.Cryptography;
using AnwarAlwaha.API.Common;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.DTOs.Orders;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private static readonly char[] CodeChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".ToCharArray();

    public OrderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            throw new ArgumentException("الطلب يجب أن يحتوي على منتج واحد على الأقل.");

        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _unitOfWork.Products.Query()
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            if (products.Count != productIds.Count)
                throw new KeyNotFoundException("أحد المنتجات المطلوبة غير موجود في النظام.");

            var normalizedPhone = SaudiPhoneNormalizer.NormalizeTo05(dto.CustomerPhone);
            var order = new Order
            {
                Id = Guid.NewGuid(),
                OrderCode = GenerateOrderCode(),
                CustomerName = dto.CustomerName.Trim(),
                CustomerPhone = !string.IsNullOrEmpty(normalizedPhone) ? normalizedPhone : dto.CustomerPhone.Trim(),
                CustomerAddress = dto.CustomerAddress?.Trim(),
                DeliveryMethod = dto.DeliveryMethod.Trim().ToLower(),
                CustomerLocationLat = dto.CustomerLocationLat,
                CustomerLocationLng = dto.CustomerLocationLng,
                CustomerNotes = dto.CustomerNotes?.Trim(),
                Status = "pending"
            };

            decimal subtotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                var product = products.First(p => p.Id == item.ProductId);

                if (!product.IsActive)
                    throw new InvalidOperationException($"المنتج ({product.Name}) غير متوفر حالياً.");

                // Allow ordering even when StockQuantity is 0 (imported POS items start with 0 stock)
                if (product.StockQuantity > 0)
                {
                    product.StockQuantity = Math.Max(0, product.StockQuantity - item.Quantity);
                    _unitOfWork.Products.Update(product);
                }

                // Strict server-side price calculation (ignores any price submitted from client)
                decimal lineTotal = product.Price * item.Quantity;
                subtotal += lineTotal;

                orderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = product.Id,
                    ProductNameSnapshot = product.Name,
                    UnitPriceSnapshot = product.Price,
                    Quantity = item.Quantity,
                    LineTotal = lineTotal,
                    ItemNotes = item.Notes?.Trim()
                });
            }

            decimal discount = await CalculateCouponDiscountAsync(subtotal, dto.CouponCode);
            order.SubtotalAmount = subtotal;
            order.DiscountAmount = discount;
            order.TotalAmount = Math.Max(0, subtotal - discount);
            order.Items = orderItems;

            await _unitOfWork.Orders.AddAsync(order);

            await _unitOfWork.CompleteAsync();
            await transaction.CommitAsync();

            return MapToResponseDto(order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto?> GetOrderByCodeAsync(string orderCode, string phoneLast4)
    {
        if (string.IsNullOrWhiteSpace(orderCode) || string.IsNullOrWhiteSpace(phoneLast4))
            return null;

        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode.Trim());

        if (order == null)
            return null;

        // IDOR protection: Verify the last 4 digits of the phone number
        var phone = order.CustomerPhone ?? string.Empty;
        if (!phone.EndsWith(phoneLast4.Trim()))
            throw new UnauthorizedAccessException("رقم الجوال المدخل لا يتطابق مع بيانات الطلب.");

        return MapToResponseDto(order);
    }

    public async Task<List<OrderResponseDto>> GetOrdersByPhoneAsync(string phone)
    {
        var core9 = SaudiPhoneNormalizer.ExtractCore9Digits(phone);
        if (string.IsNullOrWhiteSpace(core9) || core9.Length < 8)
            return new List<OrderResponseDto>();

        var candidateOrders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Where(o => o.CustomerPhone != null && o.CustomerPhone.Contains(core9))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return candidateOrders
            .Where(o => SaudiPhoneNormalizer.ArePhonesEquivalent(o.CustomerPhone, phone))
            .Select(MapToResponseDto)
            .ToList();
    }

    public async Task<PagedResult<OrderAdminListDto>> GetOrdersPagedAsync(string? status, int page, int pageSize)
    {
        var query = _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status.ToLower() == status.Trim().ToLower());
        }

        int totalCount = await query.CountAsync();
        int safePage = Math.Max(1, page);
        int safePageSize = Math.Clamp(pageSize, 1, 100);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
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

        return new PagedResult<OrderAdminListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = safePage,
            PageSize = safePageSize
        };
    }

    public async Task<OrderResponseDto?> GetOrderByIdAdminAsync(Guid id)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? null : MapToResponseDto(order);
    }

    public async Task<OrderResponseDto?> UpdateOrderStatusAsync(Guid id, OrderStatusUpdateDto dto)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return null;

        order.Status = dto.Status.Trim().ToLower();
        if (dto.AdminNotes != null)
        {
            order.AdminNotes = dto.AdminNotes.Trim();
        }

        _unitOfWork.Orders.Update(order);
        await _unitOfWork.CompleteAsync();

        return MapToResponseDto(order);
    }

    private async Task<decimal> CalculateCouponDiscountAsync(decimal subtotal, string? couponCode)
    {
        if (subtotal <= 0 || string.IsNullOrWhiteSpace(couponCode))
            return 0;

        var code = couponCode.Trim().ToUpperInvariant();
        var coupon = await _unitOfWork.Coupons.Query()
            .FirstOrDefaultAsync(c => c.Code == code && c.IsActive);

        if (coupon != null)
        {
            if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
                return 0;

            if (coupon.UsageLimit.HasValue && coupon.TimesUsed >= coupon.UsageLimit.Value)
                return 0;

            if (subtotal < coupon.MinOrderAmount)
                return 0;

            decimal discount = 0;
            if (coupon.DiscountType == "percentage")
            {
                discount = Math.Round(subtotal * (coupon.Value / 100m), 2);
                if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
                {
                    discount = coupon.MaxDiscountAmount.Value;
                }
            }
            else
            {
                discount = Math.Min(coupon.Value, subtotal);
            }

            coupon.TimesUsed++;
            _unitOfWork.Coupons.Update(coupon);
            return Math.Min(discount, subtotal);
        }

        // Fallback promo codes
        decimal fallbackDiscount = code switch
        {
            "WAHA10" or "WELCOME" or "WELCOME10" or "STUDENT" or "SCHOOL" => Math.Round(subtotal * 0.10m, 2),
            "ANWAR15" or "WAHA15" => Math.Round(subtotal * 0.15m, 2),
            "WAHA20" => subtotal >= 50 ? 20m : Math.Round(subtotal * 0.10m, 2),
            _ when code.StartsWith("WAHA") || code.StartsWith("ANWAR") => Math.Round(subtotal * 0.10m, 2),
            _ => 0m
        };

        return Math.Min(fallbackDiscount, subtotal);
    }

    private static string GenerateOrderCode()
    {
        Span<char> code = stackalloc char[8];
        var bytes = RandomNumberGenerator.GetBytes(8);
        for (int i = 0; i < 8; i++)
        {
            code[i] = CodeChars[bytes[i] % CodeChars.Length];
        }
        return $"AW-{new string(code)}";
    }

    private static OrderResponseDto MapToResponseDto(Order order)
    {
        var paymentStatus = order.Payment?.Status;
        if (string.IsNullOrWhiteSpace(paymentStatus))
        {
            var s = (order.Status ?? string.Empty).ToLowerInvariant();
            paymentStatus = s is "paid" or "processing" or "ready" or "shipping" or "delivered"
                ? "paid"
                : "pending";
        }

        return new OrderResponseDto
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            CustomerAddress = order.CustomerAddress,
            DeliveryMethod = order.DeliveryMethod,
            Status = order.Status,
            PaymentStatus = paymentStatus ?? "pending",
            SubtotalAmount = order.SubtotalAmount,
            DiscountAmount = order.DiscountAmount,
            TotalAmount = order.TotalAmount,
            CustomerNotes = order.CustomerNotes,
            AdminNotes = order.AdminNotes,
            IsReviewed = order.IsReviewed,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderItemResponseDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductNameSnapshot,
                UnitPrice = i.UnitPriceSnapshot,
                Quantity = i.Quantity,
                LineTotal = i.LineTotal,
                ItemNotes = i.ItemNotes
            }).ToList()
        };
    }
}
