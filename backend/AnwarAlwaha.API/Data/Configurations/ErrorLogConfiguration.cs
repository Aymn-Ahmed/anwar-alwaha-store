using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnwarAlwaha.API.Data.Configurations;

public class ErrorLogConfiguration : IEntityTypeConfiguration<ErrorLog>
{
    public void Configure(EntityTypeBuilder<ErrorLog> builder)
    {
        builder.ToTable("error_logs");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Message).IsRequired().HasMaxLength(2000);
        builder.Property(e => e.ExceptionType).HasMaxLength(200);
        builder.Property(e => e.StackTrace).HasMaxLength(4000);
        builder.Property(e => e.Path).HasMaxLength(500);
        builder.Property(e => e.Method).HasMaxLength(20);
        builder.Property(e => e.QueryString).HasMaxLength(1000);
        builder.Property(e => e.UserAgent).HasMaxLength(500);
        builder.Property(e => e.ClientIp).HasMaxLength(100);
        builder.Property(e => e.ResolvedBy).HasMaxLength(200);
        builder.Property(e => e.IsResolved).HasDefaultValue(false);

        builder.HasIndex(e => e.CreatedAt);
        builder.HasIndex(e => e.IsResolved);
    }
}
