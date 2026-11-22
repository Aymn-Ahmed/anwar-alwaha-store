using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnwarAlwaha.API.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261121010000_AddCategoryImageUrl")]
public partial class AddCategoryImageUrl : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE categories ADD COLUMN IF NOT EXISTS \"ImageUrl\" text NULL;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE categories DROP COLUMN IF EXISTS \"ImageUrl\";");
    }
}
