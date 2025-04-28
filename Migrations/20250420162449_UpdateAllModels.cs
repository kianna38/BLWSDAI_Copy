using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAllModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_at",
                table: "bills");

            migrationBuilder.DropColumn(
                name: "penalty",
                table: "bills");

            migrationBuilder.RenameColumn(
                name: "due_date",
                table: "bills",
                newName: "billing_date");

            migrationBuilder.AddColumn<bool>(
                name: "archived",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "archived",
                table: "readings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "reading_date",
                table: "readings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "notif_status",
                table: "payments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "penalty",
                table: "payments",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "archived",
                table: "mother_meter_readings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "archived",
                table: "consumers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "archived",
                table: "bills",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "notif_status",
                table: "bills",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "archived",
                table: "users");

            migrationBuilder.DropColumn(
                name: "archived",
                table: "readings");

            migrationBuilder.DropColumn(
                name: "reading_date",
                table: "readings");

            migrationBuilder.DropColumn(
                name: "notif_status",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "penalty",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "archived",
                table: "mother_meter_readings");

            migrationBuilder.DropColumn(
                name: "archived",
                table: "consumers");

            migrationBuilder.DropColumn(
                name: "archived",
                table: "bills");

            migrationBuilder.DropColumn(
                name: "notif_status",
                table: "bills");

            migrationBuilder.RenameColumn(
                name: "billing_date",
                table: "bills",
                newName: "due_date");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "bills",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "penalty",
                table: "bills",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
