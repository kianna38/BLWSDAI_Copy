using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMotherMeterReadingTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "reading",
                table: "mother_meter_readings",
                newName: "previous_reading");

            migrationBuilder.AddColumn<decimal>(
                name: "present_reading",
                table: "mother_meter_readings",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "present_reading",
                table: "mother_meter_readings");

            migrationBuilder.RenameColumn(
                name: "previous_reading",
                table: "mother_meter_readings",
                newName: "reading");
        }
    }
}
