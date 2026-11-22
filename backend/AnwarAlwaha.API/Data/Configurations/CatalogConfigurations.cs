using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnwarAlwaha.API.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasMaxLength(80);
        builder.Property(c => c.Title).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Description).HasMaxLength(1000);
        builder.Property(c => c.Icon).HasMaxLength(50).HasDefaultValue("📦");
        builder.Property(c => c.ImageUrl).HasColumnType("text");
        builder.Property(c => c.SortOrder).HasDefaultValue(0);
        builder.Property(c => c.IsActive).HasDefaultValue(true);
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(300);
        builder.Property(p => p.CategoryId).IsRequired().HasMaxLength(80);
        builder.Property(p => p.Price).HasPrecision(18, 2);
        builder.Property(p => p.OldPrice).HasPrecision(18, 2);
        builder.Property(p => p.StockQuantity).HasDefaultValue(100);
        builder.Property(p => p.SortOrder).HasDefaultValue(0);
        builder.Property(p => p.IsActive).HasDefaultValue(true);

        // Optimistic Concurrency Token via PostgreSQL system column 'xmin'
        builder.Property(p => p.Version)
            .HasColumnName("xmin")
            .HasColumnType("xid")
            .ValueGeneratedOnAddOrUpdate()
            .IsConcurrencyToken();

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.Name);

        builder.Property(p => p.Barcode).HasMaxLength(64);
        builder.HasIndex(p => p.Barcode);
        builder.Property(p => p.SearchKeywords).HasColumnName("search_keywords").HasColumnType("text");
        builder.Property(p => p.ImageFetchAttempted).HasDefaultValue(false);
    }
}
