using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnwarAlwaha.API.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderCode).IsRequired().HasMaxLength(50);
        builder.HasIndex(o => o.OrderCode).IsUnique();

        builder.Property(o => o.CustomerName).IsRequired().HasMaxLength(200);
        builder.Property(o => o.CustomerPhone).HasMaxLength(50);
        builder.Property(o => o.CustomerAddress).HasMaxLength(500);
        builder.Property(o => o.DeliveryMethod).HasMaxLength(50).HasDefaultValue("branch");
        builder.Property(o => o.Status).HasMaxLength(50).HasDefaultValue("pending");

        builder.Property(o => o.SubtotalAmount).HasPrecision(18, 2);
        builder.Property(o => o.DiscountAmount).HasPrecision(18, 2).HasDefaultValue(0);
        builder.Property(o => o.TotalAmount).HasPrecision(18, 2);

        builder.Property(o => o.CustomerNotes).HasMaxLength(1500);
        builder.Property(o => o.AdminNotes).HasMaxLength(1500);
        builder.Property(o => o.IsReviewed).HasDefaultValue(false);

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.Payment)
            .WithOne(p => p.Order)
            .HasForeignKey<PaymentTransaction>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.ProductNameSnapshot).IsRequired().HasMaxLength(300);
        builder.Property(i => i.UnitPriceSnapshot).HasPrecision(18, 2);
        builder.Property(i => i.Quantity).HasDefaultValue(1);
        builder.Property(i => i.LineTotal).HasPrecision(18, 2);
        builder.Property(i => i.ItemNotes).HasMaxLength(500);

        builder.HasOne(i => i.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(i => i.OrderId);
    }
}

public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.ToTable("payment_transactions");

        builder.HasKey(p => p.Id);

        // GatewayReferenceId MUST be unique to prevent replay and duplicate processing
        builder.Property(p => p.GatewayReferenceId).IsRequired().HasMaxLength(150);
        builder.HasIndex(p => p.GatewayReferenceId).IsUnique();

        builder.Property(p => p.PaymentGateway).HasMaxLength(50).HasDefaultValue("Moyasar");
        builder.Property(p => p.PaymentMethod).HasMaxLength(50).HasDefaultValue("mada");
        builder.Property(p => p.Amount).HasPrecision(18, 2);
        builder.Property(p => p.Currency).HasMaxLength(10).HasDefaultValue("SAR");
        builder.Property(p => p.Status).HasMaxLength(50).HasDefaultValue("initiated");

        builder.HasIndex(p => p.OrderId).IsUnique();
        builder.HasIndex(p => p.Status);
    }
}
