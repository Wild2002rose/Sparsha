using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sparsha_backend.Migrations
{
    /// <inheritdoc />
    public partial class bais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemOfSellers_GlobalItems_ItemsItemId",
                table: "ItemOfSellers");

            migrationBuilder.RenameColumn(
                name: "ItemsItemId",
                table: "ItemOfSellers",
                newName: "ItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ItemOfSellers_ItemsItemId",
                table: "ItemOfSellers",
                newName: "IX_ItemOfSellers_ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemOfSellers_GlobalItems_ItemId",
                table: "ItemOfSellers",
                column: "ItemId",
                principalTable: "GlobalItems",
                principalColumn: "ItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemOfSellers_GlobalItems_ItemId",
                table: "ItemOfSellers");

            migrationBuilder.RenameColumn(
                name: "ItemId",
                table: "ItemOfSellers",
                newName: "ItemsItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ItemOfSellers_ItemId",
                table: "ItemOfSellers",
                newName: "IX_ItemOfSellers_ItemsItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemOfSellers_GlobalItems_ItemsItemId",
                table: "ItemOfSellers",
                column: "ItemsItemId",
                principalTable: "GlobalItems",
                principalColumn: "ItemId");
        }
    }
}
