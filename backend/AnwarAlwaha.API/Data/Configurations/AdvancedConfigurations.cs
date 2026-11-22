using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnwarAlwaha.API.Data.Configurations;

public class ProductComplementConfiguration : IEntityTypeConfiguration<ProductComplement>
{
    public void Configure(EntityTypeBuilder<ProductComplement> builder)
    {
        builder.ToTable("product_complements");
        builder.HasKey(pc => pc.Id);

        builder.HasOne(pc => pc.Product)
            .WithMany(p => p.Complements)
            .HasForeignKey(pc => pc.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pc => pc.Complement)
            .WithMany(p => p.ComplementedBy)
            .HasForeignKey(pc => pc.ComplementId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(pc => new { pc.ProductId, pc.ComplementId }).IsUnique();
    }
}

public class ComplementGroupConfiguration : IEntityTypeConfiguration<ComplementGroup>
{
    public void Configure(EntityTypeBuilder<ComplementGroup> builder)
    {
        builder.ToTable("complement_groups");
        builder.HasKey(cg => cg.Id);
        builder.Property(cg => cg.Title).IsRequired().HasMaxLength(200);
        builder.Property(cg => cg.IsActive).HasDefaultValue(true);

        builder.HasMany(cg => cg.Items)
            .WithOne(cgi => cgi.Group)
            .HasForeignKey(cgi => cgi.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ComplementGroupItemConfiguration : IEntityTypeConfiguration<ComplementGroupItem>
{
    public void Configure(EntityTypeBuilder<ComplementGroupItem> builder)
    {
        builder.ToTable("complement_group_items");
        builder.HasKey(cgi => cgi.Id);

        builder.HasOne(cgi => cgi.Product)
            .WithMany(p => p.ComplementGroupItems)
            .HasForeignKey(cgi => cgi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(cgi => new { cgi.GroupId, cgi.ProductId }).IsUnique();
    }
}

public class CategoryComplementRuleConfiguration : IEntityTypeConfiguration<CategoryComplementRule>
{
    public void Configure(EntityTypeBuilder<CategoryComplementRule> builder)
    {
        builder.ToTable("category_complement_rules");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.SourceCategoryId).IsRequired().HasMaxLength(80);
        builder.Property(r => r.TargetCategoryId).IsRequired().HasMaxLength(80);
        builder.Property(r => r.IsActive).HasDefaultValue(true);

        builder.HasOne(r => r.SourceCategory)
            .WithMany()
            .HasForeignKey(r => r.SourceCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.TargetCategory)
            .WithMany()
            .HasForeignKey(r => r.TargetCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => new { r.SourceCategoryId, r.TargetCategoryId }).IsUnique();
    }
}

public class ProductBundleConfiguration : IEntityTypeConfiguration<ProductBundle>
{
    public void Configure(EntityTypeBuilder<ProductBundle> builder)
    {
        builder.ToTable("product_bundles");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Title).IsRequired().HasMaxLength(200);
        builder.Property(b => b.Description).HasMaxLength(1000);
        builder.Property(b => b.BundlePrice).HasPrecision(18, 2);
        builder.Property(b => b.OriginalPrice).HasPrecision(18, 2);
        builder.Property(b => b.Badge).HasMaxLength(100);
        builder.Property(b => b.IsActive).HasDefaultValue(true);

        builder.HasMany(b => b.Items)
            .WithOne(bi => bi.Bundle)
            .HasForeignKey(bi => bi.BundleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductBundleItemConfiguration : IEntityTypeConfiguration<ProductBundleItem>
{
    public void Configure(EntityTypeBuilder<ProductBundleItem> builder)
    {
        builder.ToTable("product_bundle_items");
        builder.HasKey(bi => bi.Id);
        builder.Property(bi => bi.Quantity).HasDefaultValue(1);

        builder.HasOne(bi => bi.Product)
            .WithMany(p => p.BundleItems)
            .HasForeignKey(bi => bi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(bi => new { bi.BundleId, bi.ProductId }).IsUnique();
    }
}

public class ServiceItemConfiguration : IEntityTypeConfiguration<ServiceItem>
{
    public void Configure(EntityTypeBuilder<ServiceItem> builder)
    {
        builder.ToTable("services");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Title).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Description).IsRequired().HasMaxLength(1500);
        builder.Property(s => s.IconName).HasMaxLength(50).HasDefaultValue("sparkles");
        builder.Property(s => s.AccentColor).HasMaxLength(30).HasDefaultValue("#0284c7");
        builder.Property(s => s.MediaType).HasMaxLength(30).HasDefaultValue("none");
        builder.Property(s => s.MediaUrl).HasMaxLength(1000);
        builder.Property(s => s.LinkedCategoryId).HasMaxLength(80);
        builder.Property(s => s.WhatsAppTemplate).HasMaxLength(1000);
        builder.Property(s => s.IsActive).HasDefaultValue(true);

        builder.HasOne(s => s.LinkedCategory)
            .WithMany(c => c.LinkedServices)
            .HasForeignKey(s => s.LinkedCategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ProductReviewConfiguration : IEntityTypeConfiguration<ProductReview>
{
    public void Configure(EntityTypeBuilder<ProductReview> builder)
    {
        builder.ToTable("product_reviews");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.OrderCode).IsRequired().HasMaxLength(50);
        builder.Property(r => r.CustomerName).IsRequired().HasMaxLength(200);
        builder.Property(r => r.Rating).HasDefaultValue(5);
        builder.Property(r => r.Comment).HasMaxLength(1500);
        builder.Property(r => r.IsApproved).HasDefaultValue(false);

        builder.HasOne(r => r.Product)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Order)
            .WithMany(o => o.Reviews)
            .HasForeignKey(r => r.OrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(r => r.ProductId);
        builder.HasIndex(r => r.IsApproved);
    }
}

public class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.ToTable("admin_users");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(150);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.FullName).HasMaxLength(150).HasDefaultValue("مسؤول المتجر");
        builder.Property(u => u.Role).HasMaxLength(50).HasDefaultValue("Admin");
        builder.Property(u => u.IsActive).HasDefaultValue(true);
    }
}
