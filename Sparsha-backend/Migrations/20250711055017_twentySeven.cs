using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sparsha_backend.Migrations
{
    /// <inheritdoc />
    public partial class twentySeven : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "BiddingEndTime",
                table: "ItemOfSellers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBiddingLocked",
                table: "ItemOfSellers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BiddingEndTime",
                table: "ItemOfSellers");

            migrationBuilder.DropColumn(
                name: "IsBiddingLocked",
                table: "ItemOfSellers");
        }
    }
}
