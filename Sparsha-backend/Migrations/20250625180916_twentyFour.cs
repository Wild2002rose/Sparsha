using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sparsha_backend.Migrations
{
    /// <inheritdoc />
    public partial class twentyFour : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeviceToken",
                table: "Member",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeviceToken",
                table: "Member");
        }
    }
}
