using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductComplement> ProductComplements => Set<ProductComplement>();
    public DbSet<ComplementGroup> ComplementGroups => Set<ComplementGroup>();
    public DbSet<ComplementGroupItem> ComplementGroupItems => Set<ComplementGroupItem>();
    public DbSet<CategoryComplementRule> CategoryComplementRules => Set<CategoryComplementRule>();
    public DbSet<ProductBundle> ProductBundles => Set<ProductBundle>();
    public DbSet<ProductBundleItem> ProductBundleItems => Set<ProductBundleItem>();
    public DbSet<ServiceItem> Services => Set<ServiceItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PaymentTransaction> Payments => Set<PaymentTransaction>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<StoreSetting> StoreSettings => Set<StoreSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations in current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
