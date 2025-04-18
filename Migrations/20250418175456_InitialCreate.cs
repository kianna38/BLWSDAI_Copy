using System;
using BLWSDAI.Models;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BLWSDAI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                //.Annotation("Npgsql:Enum:public.bill_status_enum", "unpaid,partial,overdue,paid")
                //.Annotation("Npgsql:Enum:public.consumer_status_enum", "active,disconnected,cut")
                //.Annotation("Npgsql:Enum:public.notif_pref_enum", "sms,email,sms_and_email,none")
                //.Annotation("Npgsql:Enum:public.payment_type_enum", "cash,gcash,maya")
                //.Annotation("Npgsql:Enum:public.purok_enum", "_1,_2,_3,_4,_5")
                .Annotation("Npgsql:Enum:public.user_role_enum", "admin,staff");
                //.Annotation("Npgsql:Enum:user_role_enum", "admin,staff");

            migrationBuilder.CreateTable(
                name: "consumers",
                columns: table => new
                {
                    consumer_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    first_name = table.Column<string>(type: "text", nullable: false),
                    last_name = table.Column<string>(type: "text", nullable: false),
                    middle_initial = table.Column<string>(type: "text", nullable: true),
                    meter_serial = table.Column<string>(type: "text", nullable: false),
                    phone_number = table.Column<string>(type: "text", nullable: false),
                    purok = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    notif_preference = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_consumers", x => x.consumer_id);
                    table.CheckConstraint("CK_Consumer_PhoneNumber_Format", "phone_number ~ '^09[0-9]{9}$'");
                });

            migrationBuilder.CreateTable(
                name: "mother_meter_readings",
                columns: table => new
                {
                    mother_meter_reading_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    month_year = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    reading = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_mother_meter_readings", x => x.mother_meter_reading_id);
                });

            migrationBuilder.CreateTable(
                name: "salary_infos",
                columns: table => new
                {
                    salary_info_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    president_salary = table.Column<decimal>(type: "numeric", nullable: false),
                    vice_president_salary = table.Column<decimal>(type: "numeric", nullable: false),
                    secretary_salary = table.Column<decimal>(type: "numeric", nullable: false),
                    treasurer_salary = table.Column<decimal>(type: "numeric", nullable: false),
                    auditor_salary = table.Column<decimal>(type: "numeric", nullable: false),
                    maintenance1salary = table.Column<decimal>(type: "numeric", nullable: false),
                    maintenance2salary = table.Column<decimal>(type: "numeric", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_salary_infos", x => x.salary_info_id);
                    table.CheckConstraint("CK_SalaryInfo_SingleRow", "salary_info_id = 1");
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<UserRoleEnum>(type: "user_role_enum", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "readings",
                columns: table => new
                {
                    reading_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    consumer_id = table.Column<int>(type: "integer", nullable: false),
                    month_year = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    present_reading = table.Column<decimal>(type: "numeric", nullable: false),
                    previous_reading = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_readings", x => x.reading_id);
                    table.ForeignKey(
                        name: "fk_readings_consumers_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "consumers",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bills",
                columns: table => new
                {
                    bill_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    consumer_id = table.Column<int>(type: "integer", nullable: false),
                    reading_id = table.Column<int>(type: "integer", nullable: false),
                    mother_meter_reading_id = table.Column<int>(type: "integer", nullable: true),
                    month_year = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    system_loss = table.Column<decimal>(type: "numeric", nullable: false),
                    subsidy = table.Column<decimal>(type: "numeric", nullable: false),
                    penalty = table.Column<decimal>(type: "numeric", nullable: false),
                    balance = table.Column<decimal>(type: "numeric", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bills", x => x.bill_id);
                    table.CheckConstraint("CK_Bill_TotalAmount_Positive", "total_amount >= 0");
                    table.ForeignKey(
                        name: "fk_bills_consumers_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "consumers",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_bills_mother_meter_readings_mother_meter_reading_id",
                        column: x => x.mother_meter_reading_id,
                        principalTable: "mother_meter_readings",
                        principalColumn: "mother_meter_reading_id");
                    table.ForeignKey(
                        name: "fk_bills_readings_reading_id",
                        column: x => x.reading_id,
                        principalTable: "readings",
                        principalColumn: "reading_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    consumer_id = table.Column<int>(type: "integer", nullable: false),
                    bill_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: true),
                    payment_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    payment_type = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payments", x => x.payment_id);
                    table.CheckConstraint("CK_Payment_AmountPaid_Positive", "amount_paid >= 0");
                    table.ForeignKey(
                        name: "fk_payments_bills_bill_id",
                        column: x => x.bill_id,
                        principalTable: "bills",
                        principalColumn: "bill_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_payments_consumers_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "consumers",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_payments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateIndex(
                name: "ix_bills_consumer_id_month_year",
                table: "bills",
                columns: new[] { "consumer_id", "month_year" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_bills_mother_meter_reading_id",
                table: "bills",
                column: "mother_meter_reading_id");

            migrationBuilder.CreateIndex(
                name: "ix_bills_reading_id",
                table: "bills",
                column: "reading_id");

            migrationBuilder.CreateIndex(
                name: "ix_consumers_meter_serial",
                table: "consumers",
                column: "meter_serial",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_payments_bill_id",
                table: "payments",
                column: "bill_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_consumer_id",
                table: "payments",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_user_id",
                table: "payments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_readings_consumer_id_month_year",
                table: "readings",
                columns: new[] { "consumer_id", "month_year" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "salary_infos");

            migrationBuilder.DropTable(
                name: "bills");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "mother_meter_readings");

            migrationBuilder.DropTable(
                name: "readings");

            migrationBuilder.DropTable(
                name: "consumers");
        }
    }
}
