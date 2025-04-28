using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTablesNoArchived : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_SalaryInfo_SingleRow",
                table: "salary_infos");

            migrationBuilder.DropColumn(
                name: "archived",
                table: "users");

            migrationBuilder.DropColumn(
                name: "archived",
                table: "readings");

            migrationBuilder.DropColumn(
                name: "archived",
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<bool>(
                name: "archived",
                table: "payments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

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

            migrationBuilder.AddCheckConstraint(
                name: "CK_SalaryInfo_SingleRow",
                table: "salary_infos",
                sql: "salary_info_id = 1");
        }
    }
}
