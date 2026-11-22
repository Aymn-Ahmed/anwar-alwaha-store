using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnwarAlwaha.API.Data.Migrations;

/// <summary>
/// Adds products.Barcode (+ index). Idempotent: safe on databases created from the SQL master script.
/// </summary>
[DbContext(typeof(AppDbContext))]
[Migration("20261121000000_AddProductBarcode")]
public partial class AddProductBarcode : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS \"Barcode\" character varying(64) NULL;");
        migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_products_Barcode\" ON products (\"Barcode\");");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DROP INDEX IF EXISTS \"IX_products_Barcode\";");
        migrationBuilder.Sql("ALTER TABLE products DROP COLUMN IF EXISTS \"Barcode\";");
    }
}
