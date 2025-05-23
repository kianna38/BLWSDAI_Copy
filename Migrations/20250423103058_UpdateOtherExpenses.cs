﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOtherExpenses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "month_year",
                table: "other_expenses");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "month_year",
                table: "other_expenses",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
