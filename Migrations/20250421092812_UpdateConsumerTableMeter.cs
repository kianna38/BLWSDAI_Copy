using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateConsumerTableMeter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "meter_serial",
                table: "consumers",
                newName: "meter_number");

            migrationBuilder.RenameIndex(
                name: "ix_consumers_meter_serial",
                table: "consumers",
                newName: "ix_consumers_meter_number");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "meter_number",
                table: "consumers",
                newName: "meter_serial");

            migrationBuilder.RenameIndex(
                name: "ix_consumers_meter_number",
                table: "consumers",
                newName: "ix_consumers_meter_serial");
        }
    }
}
