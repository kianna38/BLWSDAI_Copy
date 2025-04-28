using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_at",
                table: "readings");

            migrationBuilder.RenameColumn(
                name: "subsidy",
                table: "rates_info",
                newName: "subsidy_rate");

            migrationBuilder.RenameColumn(
                name: "penalty",
                table: "rates_info",
                newName: "penalty_rate");

            migrationBuilder.RenameColumn(
                name: "mother_meter_cubic_meter",
                table: "rates_info",
                newName: "mother_meter_cubic_meter_rate");

            migrationBuilder.RenameColumn(
                name: "consumer_cubic_meter",
                table: "rates_info",
                newName: "consumer_cubic_meter_rate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "subsidy_rate",
                table: "rates_info",
                newName: "subsidy");

            migrationBuilder.RenameColumn(
                name: "penalty_rate",
                table: "rates_info",
                newName: "penalty");

            migrationBuilder.RenameColumn(
                name: "mother_meter_cubic_meter_rate",
                table: "rates_info",
                newName: "mother_meter_cubic_meter");

            migrationBuilder.RenameColumn(
                name: "consumer_cubic_meter_rate",
                table: "rates_info",
                newName: "consumer_cubic_meter");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "readings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
