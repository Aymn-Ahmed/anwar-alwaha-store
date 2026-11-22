using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnwarAlwaha.API.Data.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "admin_users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                FullName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false, defaultValue: "مسؤول المتجر"),
                Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Admin"),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                RefreshToken = table.Column<string>(type: "text", nullable: true),
                RefreshTokenExpiryTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_admin_users", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "categories",
            columns: table => new
            {
                Id = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "📦"),
                SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_categories", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "complement_groups",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_complement_groups", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "orders",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrderCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                CustomerPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                CustomerAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                DeliveryMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "branch"),
                CustomerLocationLat = table.Column<double>(type: "double precision", nullable: true),
                CustomerLocationLng = table.Column<double>(type: "double precision", nullable: true),
                Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "pending"),
                SubtotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                CustomerNotes = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: true),
                AdminNotes = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: true),
                IsReviewed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_orders", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "product_bundles",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                BundlePrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                OriginalPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                Badge = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_product_bundles", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "category_complement_rules",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                SourceCategoryId = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                TargetCategoryId = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_category_complement_rules", x => x.Id);
                table.ForeignKey(
                    name: "FK_category_complement_rules_categories_SourceCategoryId",
                    column: x => x.SourceCategoryId,
                    principalTable: "categories",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_category_complement_rules_categories_TargetCategoryId",
                    column: x => x.TargetCategoryId,
                    principalTable: "categories",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "products",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CategoryId = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                Name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                ImageUrl = table.Column<string>(type: "text", nullable: true),
                TikTokVideoId = table.Column<string>(type: "text", nullable: true),
                Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                OldPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                StockQuantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 100),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_products", x => x.Id);
                table.ForeignKey(
                    name: "FK_products_categories_CategoryId",
                    column: x => x.CategoryId,
                    principalTable: "categories",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "services",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: false),
                IconName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "sparkles"),
                AccentColor = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "#0284c7"),
                MediaType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "none"),
                MediaUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                LinkedCategoryId = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                WhatsAppTemplate = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_services", x => x.Id);
                table.ForeignKey(
                    name: "FK_services_categories_LinkedCategoryId",
                    column: x => x.LinkedCategoryId,
                    principalTable: "categories",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "payment_transactions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                PaymentGateway = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Moyasar"),
                GatewayReferenceId = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "mada"),
                Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "SAR"),
                Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "initiated"),
                RawWebhookPayload = table.Column<string>(type: "text", nullable: true),
                PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_payment_transactions", x => x.Id);
                table.ForeignKey(
                    name: "FK_payment_transactions_orders_OrderId",
                    column: x => x.OrderId,
                    principalTable: "orders",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "complement_group_items",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_complement_group_items", x => x.Id);
                table.ForeignKey(
                    name: "FK_complement_group_items_complement_groups_GroupId",
                    column: x => x.GroupId,
                    principalTable: "complement_groups",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_complement_group_items_products_ProductId",
                    column: x => x.ProductId,
                    principalTable: "products",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "order_items",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                ProductNameSnapshot = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                UnitPriceSnapshot = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                LineTotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                ItemNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_order_items", x => x.Id);
                table.ForeignKey(
                    name: "FK_order_items_orders_OrderId",
                    column: x => x.OrderId,
                    principalTable: "orders",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_order_items_products_ProductId",
                    column: x => x.ProductId,
                    principalTable: "products",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "product_bundle_items",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                BundleId = table.Column<Guid>(type: "uuid", nullable: false),
                ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                Quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_product_bundle_items", x => x.Id);
                table.ForeignKey(
                    name: "FK_product_bundle_items_product_bundles_BundleId",
                    column: x => x.BundleId,
                    principalTable: "product_bundles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_product_bundle_items_products_ProductId",
                    column: x => x.ProductId,
                    principalTable: "products",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "product_complements",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                ComplementId = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_product_complements", x => x.Id);
                table.ForeignKey(
                    name: "FK_product_complements_products_ComplementId",
                    column: x => x.ComplementId,
                    principalTable: "products",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_product_complements_products_ProductId",
                    column: x => x.ProductId,
                    principalTable: "products",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "product_reviews",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                OrderCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Rating = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                Comment = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: true),
                MediaUrls = table.Column<string[]>(type: "text[]", nullable: false),
                IsApproved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_product_reviews", x => x.Id);
                table.ForeignKey(
                    name: "FK_product_reviews_orders_OrderId",
                    column: x => x.OrderId,
                    principalTable: "orders",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_product_reviews_products_ProductId",
                    column: x => x.ProductId,
                    principalTable: "products",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_admin_users_Email",
            table: "admin_users",
            column: "Email",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_category_complement_rules_SourceCategoryId_TargetCategoryId",
            table: "category_complement_rules",
            columns: new[] { "SourceCategoryId", "TargetCategoryId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_category_complement_rules_TargetCategoryId",
            table: "category_complement_rules",
            column: "TargetCategoryId");

        migrationBuilder.CreateIndex(
            name: "IX_complement_group_items_GroupId_ProductId",
            table: "complement_group_items",
            columns: new[] { "GroupId", "ProductId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_complement_group_items_ProductId",
            table: "complement_group_items",
            column: "ProductId");

        migrationBuilder.CreateIndex(
            name: "IX_order_items_OrderId",
            table: "order_items",
            column: "OrderId");

        migrationBuilder.CreateIndex(
            name: "IX_order_items_ProductId",
            table: "order_items",
            column: "ProductId");

        migrationBuilder.CreateIndex(
            name: "IX_orders_CreatedAt",
            table: "orders",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_orders_OrderCode",
            table: "orders",
            column: "OrderCode",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_orders_Status",
            table: "orders",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_payment_transactions_GatewayReferenceId",
            table: "payment_transactions",
            column: "GatewayReferenceId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_payment_transactions_OrderId",
            table: "payment_transactions",
            column: "OrderId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_payment_transactions_Status",
            table: "payment_transactions",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_product_bundle_items_BundleId_ProductId",
            table: "product_bundle_items",
            columns: new[] { "BundleId", "ProductId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_product_bundle_items_ProductId",
            table: "product_bundle_items",
            column: "ProductId");

        migrationBuilder.CreateIndex(
            name: "IX_product_complements_ComplementId",
            table: "product_complements",
            column: "ComplementId");

        migrationBuilder.CreateIndex(
            name: "IX_product_complements_ProductId_ComplementId",
            table: "product_complements",
            columns: new[] { "ProductId", "ComplementId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_product_reviews_IsApproved",
            table: "product_reviews",
            column: "IsApproved");

        migrationBuilder.CreateIndex(
            name: "IX_product_reviews_OrderId",
            table: "product_reviews",
            column: "OrderId");

        migrationBuilder.CreateIndex(
            name: "IX_product_reviews_ProductId",
            table: "product_reviews",
            column: "ProductId");

        migrationBuilder.CreateIndex(
            name: "IX_products_CategoryId",
            table: "products",
            column: "CategoryId");

        migrationBuilder.CreateIndex(
            name: "IX_products_Name",
            table: "products",
            column: "Name");

        migrationBuilder.CreateIndex(
            name: "IX_services_LinkedCategoryId",
            table: "services",
            column: "LinkedCategoryId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "admin_users");
        migrationBuilder.DropTable(name: "category_complement_rules");
        migrationBuilder.DropTable(name: "complement_group_items");
        migrationBuilder.DropTable(name: "complement_groups");
        migrationBuilder.DropTable(name: "order_items");
        migrationBuilder.DropTable(name: "payment_transactions");
        migrationBuilder.DropTable(name: "product_bundle_items");
        migrationBuilder.DropTable(name: "product_bundles");
        migrationBuilder.DropTable(name: "product_complements");
        migrationBuilder.DropTable(name: "product_reviews");
        migrationBuilder.DropTable(name: "services");
        migrationBuilder.DropTable(name: "products");
        migrationBuilder.DropTable(name: "orders");
        migrationBuilder.DropTable(name: "categories");
    }
}
