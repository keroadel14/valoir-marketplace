using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valoir.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewsFollowsNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent: safe on DBs where tables were created manually during verification
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS "ProductReviews" (
                    "Id" uuid NOT NULL PRIMARY KEY,
                    "ProductId" uuid NOT NULL,
                    "BuyerId" uuid NOT NULL,
                    "OrderId" uuid NOT NULL,
                    "Rating" integer NOT NULL,
                    "Title" character varying(200),
                    "Body" character varying(4000) NOT NULL,
                    "IsVisible" boolean NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone,
                    "RowVersion" bytea
                );
                CREATE INDEX IF NOT EXISTS "IX_ProductReviews_ProductId" ON "ProductReviews" ("ProductId");
                CREATE INDEX IF NOT EXISTS "IX_ProductReviews_BuyerId" ON "ProductReviews" ("BuyerId");
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_ProductReviews_BuyerId_ProductId_OrderId"
                    ON "ProductReviews" ("BuyerId", "ProductId", "OrderId");

                CREATE TABLE IF NOT EXISTS "SellerFollows" (
                    "Id" uuid NOT NULL PRIMARY KEY,
                    "BuyerId" uuid NOT NULL,
                    "BoutiqueId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone,
                    "RowVersion" bytea
                );
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_SellerFollows_BuyerId_BoutiqueId"
                    ON "SellerFollows" ("BuyerId", "BoutiqueId");
                CREATE INDEX IF NOT EXISTS "IX_SellerFollows_BoutiqueId" ON "SellerFollows" ("BoutiqueId");

                CREATE TABLE IF NOT EXISTS "UserNotifications" (
                    "Id" uuid NOT NULL PRIMARY KEY,
                    "UserId" uuid NOT NULL,
                    "Type" character varying(64) NOT NULL,
                    "Title" character varying(200) NOT NULL,
                    "Message" character varying(2000) NOT NULL,
                    "LinkUrl" character varying(500),
                    "IsRead" boolean NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone,
                    "RowVersion" bytea
                );
                CREATE INDEX IF NOT EXISTS "IX_UserNotifications_UserId_IsRead"
                    ON "UserNotifications" ("UserId", "IsRead");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS "ProductReviews";
                DROP TABLE IF EXISTS "SellerFollows";
                DROP TABLE IF EXISTS "UserNotifications";
                """);
        }
    }
}
