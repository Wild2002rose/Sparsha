using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sparsha_backend.Migrations
{
    /// <inheritdoc />
    public partial class sixteen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Member",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Member");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Member",
                newName: "PinCode");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Member",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

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

            migrationBuilder.AddPrimaryKey(
                name: "PK_Member",
                table: "Member",
                column: "UserId");

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    ClientId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MobileNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pincode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.ClientId);
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Member_Clients_ClientId",
                table: "Member");

            migrationBuilder.DropForeignKey(
                name: "FK_Member_Sellers_SellerId",
                table: "Member");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Member",
                table: "Member");

            migrationBuilder.DropIndex(
                name: "IX_Member_ClientId",
                table: "Member");

            migrationBuilder.DropIndex(
                name: "IX_Member_SellerId",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "Member");

            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "Member");

            migrationBuilder.RenameColumn(
                name: "PinCode",
                table: "Member",
                newName: "LastName");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Member",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Member",
                table: "Member",
                column: "Id");
        }
    }
}
