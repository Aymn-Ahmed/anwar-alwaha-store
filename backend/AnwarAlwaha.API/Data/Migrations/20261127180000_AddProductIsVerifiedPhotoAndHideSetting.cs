using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnwarAlwaha.API.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261127180000_AddProductIsVerifiedPhotoAndHideSetting")]
public partial class AddProductIsVerifiedPhotoAndHideSetting : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS \"IsVerifiedPhoto\" boolean NOT NULL DEFAULT false;");
        migrationBuilder.Sql("ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS \"HideUnverifiedPhotos\" boolean NOT NULL DEFAULT false;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE products DROP COLUMN IF EXISTS \"IsVerifiedPhoto\";");
        migrationBuilder.Sql("ALTER TABLE store_settings DROP COLUMN IF EXISTS \"HideUnverifiedPhotos\";");
    }
}
