using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateConsumerUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateIndex(
                name: "ix_consumers_email",
                table: "consumers",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_consumers_phone_number",
                table: "consumers",
                column: "phone_number",
                unique: true);

            migrationBuilder.CreateIndex(
               name: "ix_consumers_email",
               table: "consumers",
               column: "email",
               unique: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_consumers_email",
                table: "consumers");

            migrationBuilder.DropIndex(
                name: "ix_consumers_phone_number",
                table: "consumers");

            migrationBuilder.DropColumn(
                name: "service_fee_rate",
                table: "rates_info");
        }
    }
}
