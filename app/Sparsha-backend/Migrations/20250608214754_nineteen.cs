﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sparsha_backend.Migrations
{
    /// <inheritdoc />
    public partial class nineteen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Member",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Member");
        }
    }
}
