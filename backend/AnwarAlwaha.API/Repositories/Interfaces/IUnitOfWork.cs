using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace AnwarAlwaha.API.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Product> Products { get; }
    IGenericRepository<ProductBundle> ProductBundles { get; }
    IGenericRepository<ProductBundleItem> ProductBundleItems { get; }
    IGenericRepository<ProductComplement> ProductComplements { get; }
    IGenericRepository<Order> Orders { get; }
    IGenericRepository<OrderItem> OrderItems { get; }
    IGenericRepository<PaymentTransaction> Payments { get; }
    IGenericRepository<ServiceItem> Services { get; }
    IGenericRepository<ProductReview> Reviews { get; }
    IGenericRepository<AdminUser> AdminUsers { get; }
    IGenericRepository<ErrorLog> ErrorLogs { get; }
    IGenericRepository<Coupon> Coupons { get; }
    IGenericRepository<StoreSetting> StoreSettings { get; }

    Task<int> CompleteAsync();
    Task<IDbContextTransaction> BeginTransactionAsync();
}
