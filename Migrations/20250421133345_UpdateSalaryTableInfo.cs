using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSalaryTableInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "maintenance2salary",
                table: "salary_infos",
                newName: "maintenance_two_salary");

            migrationBuilder.RenameColumn(
                name: "maintenance1salary",
                table: "salary_infos",
                newName: "maintenance_one_salary");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "maintenance_two_salary",
                table: "salary_infos",
                newName: "maintenance2salary");

            migrationBuilder.RenameColumn(
                name: "maintenance_one_salary",
                table: "salary_infos",
                newName: "maintenance1salary");
        }
    }
}
