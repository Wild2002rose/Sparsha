using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sparsha_backend.Migrations
{
    /// <inheritdoc />
    public partial class seventeen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Member_Clients_ClientId",
                table: "Member");

            migrationBuilder.DropForeignKey(
                name: "FK_Member_Sellers_SellerId",
                table: "Member");

            migrationBuilder.DropIndex(
                name: "IX_Member_ClientId",
                table: "Member");

            migrationBuilder.DropIndex(
                name: "IX_Member_SellerId",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "Member");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Member_ClientId",
                table: "Clients",
                column: "ClientId",
                principalTable: "Member",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_Member_SellerId",
                table: "Sellers",
                column: "SellerId",
                principalTable: "Member",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Member_ClientId",
                table: "Clients");

            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_Member_SellerId",
                table: "Sellers");

            migrationBuilder.AddColumn<string>(
                name: "ClientId",
                table: "Member",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SellerId",
                table: "Member",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Member_ClientId",
                table: "Member",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Member_SellerId",
                table: "Member",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Member_Clients_ClientId",
                table: "Member",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "ClientId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Member_Sellers_SellerId",
                table: "Member",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "SellerId");
        }
    }
}
