using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnwarAlwaha.API.Data.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("coupons");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(c => c.Code).IsUnique();

        builder.Property(c => c.DiscountType).IsRequired().HasMaxLength(20).HasDefaultValue("percentage");
        builder.Property(c => c.Value).HasPrecision(18, 2);
        builder.Property(c => c.MinOrderAmount).HasPrecision(18, 2).HasDefaultValue(0);
        builder.Property(c => c.MaxDiscountAmount).HasPrecision(18, 2);
        builder.Property(c => c.IsActive).HasDefaultValue(true);
        builder.Property(c => c.Description).HasMaxLength(500);

        builder.HasIndex(c => c.IsActive);
    }
}
