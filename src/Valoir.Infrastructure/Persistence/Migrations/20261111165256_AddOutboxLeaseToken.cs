using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valoir.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOutboxLeaseToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LeaseToken",
                table: "OutboxMessages",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LeaseToken",
                table: "OutboxMessages");
        }
    }
}
