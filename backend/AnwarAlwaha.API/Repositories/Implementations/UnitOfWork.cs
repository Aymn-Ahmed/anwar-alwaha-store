using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace AnwarAlwaha.API.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Categories = new GenericRepository<Category>(_context);
        Products = new GenericRepository<Product>(_context);
        ProductBundles = new GenericRepository<ProductBundle>(_context);
        ProductBundleItems = new GenericRepository<ProductBundleItem>(_context);
        ProductComplements = new GenericRepository<ProductComplement>(_context);
        Orders = new GenericRepository<Order>(_context);
        OrderItems = new GenericRepository<OrderItem>(_context);
        Payments = new GenericRepository<PaymentTransaction>(_context);
        Services = new GenericRepository<ServiceItem>(_context);
        Reviews = new GenericRepository<ProductReview>(_context);
        AdminUsers = new GenericRepository<AdminUser>(_context);
        ErrorLogs = new GenericRepository<ErrorLog>(_context);
        Coupons = new GenericRepository<Coupon>(_context);
        StoreSettings = new GenericRepository<StoreSetting>(_context);
    }

    public IGenericRepository<Category> Categories { get; }
    public IGenericRepository<Product> Products { get; }
    public IGenericRepository<ProductBundle> ProductBundles { get; }
    public IGenericRepository<ProductBundleItem> ProductBundleItems { get; }
    public IGenericRepository<ProductComplement> ProductComplements { get; }
    public IGenericRepository<Order> Orders { get; }
    public IGenericRepository<OrderItem> OrderItems { get; }
    public IGenericRepository<PaymentTransaction> Payments { get; }
    public IGenericRepository<ServiceItem> Services { get; }
    public IGenericRepository<ProductReview> Reviews { get; }
    public IGenericRepository<AdminUser> AdminUsers { get; }
    public IGenericRepository<ErrorLog> ErrorLogs { get; }
    public IGenericRepository<Coupon> Coupons { get; }
    public IGenericRepository<StoreSetting> StoreSettings { get; }

    public async Task<int> CompleteAsync() => await _context.SaveChangesAsync();

    public async Task<IDbContextTransaction> BeginTransactionAsync() =>
        await _context.Database.BeginTransactionAsync();

    public void Dispose() => _context.Dispose();
}
