using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class AddRatesInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:public.bill_status_enum", "unpaid,partial,overdue,paid")
                .Annotation("Npgsql:Enum:public.consumer_status_enum", "active,disconnected,cut")
                .Annotation("Npgsql:Enum:public.notif_pref_enum", "email,sms,sms_and_email,none")
                .Annotation("Npgsql:Enum:public.payment_type_enum", "cash,gcash,maya")
                .Annotation("Npgsql:Enum:public.purok_enum", "_1,_2,_3,_4,_5")
                .Annotation("Npgsql:Enum:public.user_role_enum", "admin,staff")
                .Annotation("Npgsql:Enum:user_role_enum", "admin,staff")
                .OldAnnotation("Npgsql:Enum:public.bill_status_enum", "unpaid,partial,overdue,paid")
                .OldAnnotation("Npgsql:Enum:public.consumer_status_enum", "active,disconnected,cut")
                .OldAnnotation("Npgsql:Enum:public.notif_pref_enum", "sms,email,sms_and_email,none")
                .OldAnnotation("Npgsql:Enum:public.payment_type_enum", "cash,gcash,maya")
                .OldAnnotation("Npgsql:Enum:public.purok_enum", "_1,_2,_3,_4,_5")
                .OldAnnotation("Npgsql:Enum:public.user_role_enum", "admin,staff")
                .OldAnnotation("Npgsql:Enum:user_role_enum", "admin,staff");

            migrationBuilder.CreateTable(
                name: "rates_info",
                columns: table => new
                {
                    rates_info_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    consumer_cubic_meter = table.Column<decimal>(type: "numeric", nullable: false),
                    mother_meter_cubic_meter = table.Column<decimal>(type: "numeric", nullable: false),
                    penalty = table.Column<decimal>(type: "numeric", nullable: false),
                    subsidy = table.Column<decimal>(type: "numeric", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rates_info", x => x.rates_info_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "rates_info");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:public.bill_status_enum", "unpaid,partial,overdue,paid")
                .Annotation("Npgsql:Enum:public.consumer_status_enum", "active,disconnected,cut")
                .Annotation("Npgsql:Enum:public.notif_pref_enum", "sms,email,sms_and_email,none")
                .Annotation("Npgsql:Enum:public.payment_type_enum", "cash,gcash,maya")
                .Annotation("Npgsql:Enum:public.purok_enum", "_1,_2,_3,_4,_5")
                .Annotation("Npgsql:Enum:public.user_role_enum", "admin,staff")
                .Annotation("Npgsql:Enum:user_role_enum", "admin,staff")
                .OldAnnotation("Npgsql:Enum:public.bill_status_enum", "unpaid,partial,overdue,paid")
                .OldAnnotation("Npgsql:Enum:public.consumer_status_enum", "active,disconnected,cut")
                .OldAnnotation("Npgsql:Enum:public.notif_pref_enum", "email,sms,sms_and_email,none")
                .OldAnnotation("Npgsql:Enum:public.payment_type_enum", "cash,gcash,maya")
                .OldAnnotation("Npgsql:Enum:public.purok_enum", "_1,_2,_3,_4,_5")
                .OldAnnotation("Npgsql:Enum:public.user_role_enum", "admin,staff")
                .OldAnnotation("Npgsql:Enum:user_role_enum", "admin,staff");
        }
    }
}
