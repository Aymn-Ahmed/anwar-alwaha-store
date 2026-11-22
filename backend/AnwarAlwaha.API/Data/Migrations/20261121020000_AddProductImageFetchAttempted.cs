using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnwarAlwaha.API.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261121020000_AddProductImageFetchAttempted")]
public partial class AddProductImageFetchAttempted : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS \"ImageFetchAttempted\" boolean NOT NULL DEFAULT false;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE products DROP COLUMN IF EXISTS \"ImageFetchAttempted\";");
    }
}
