using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sparsha_backend.Migrations
{
    /// <inheritdoc />
    public partial class ekush : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ItemsItemId",
                table: "ItemOfSellers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemOfSellers_ItemsItemId",
                table: "ItemOfSellers",
                column: "ItemsItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemOfSellers_GlobalItems_ItemsItemId",
                table: "ItemOfSellers",
                column: "ItemsItemId",
                principalTable: "GlobalItems",
                principalColumn: "ItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemOfSellers_GlobalItems_ItemsItemId",
                table: "ItemOfSellers");

            migrationBuilder.DropIndex(
                name: "IX_ItemOfSellers_ItemsItemId",
                table: "ItemOfSellers");

            migrationBuilder.DropColumn(
                name: "ItemsItemId",
                table: "ItemOfSellers");
        }
    }
}
