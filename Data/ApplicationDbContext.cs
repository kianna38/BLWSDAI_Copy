using Microsoft.EntityFrameworkCore;
using BLWSDAI.Models;
using Npgsql;

namespace BLWSDAI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        // DbSets
        public DbSet<Consumer> Consumers { get; set; }
        public DbSet<Reading> Readings { get; set; }
        public DbSet<MotherMeterReading> MotherMeterReadings { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<SalaryInfo> SalaryInfos { get; set; }
        public DbSet<RatesInfo> RatesInfo { get; set; }
        public DbSet<OtherExpense> OtherExpenses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Register Enums
            modelBuilder.HasPostgresEnum<PurokEnum>("public", "purok_enum");
            modelBuilder.HasPostgresEnum<ConsumerStatusEnum>("public", "consumer_status_enum");
            modelBuilder.HasPostgresEnum<NotifPrefEnum>("public", "notif_pref_enum");
            modelBuilder.HasPostgresEnum<BillStatusEnum>("public", "bill_status_enum");
            modelBuilder.HasPostgresEnum<UserRoleEnum>("public", "user_role_enum");
            modelBuilder.HasPostgresEnum<PaymentTypeEnum>("public", "payment_type_enum");


            // Composite Unique Constraints & Field Constraints
            modelBuilder.Entity<OtherExpense>()
                .HasKey(e => e.ExpenseId);


            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Consumer>()
                .HasIndex(c => c.MeterNumber)
                .IsUnique();

            modelBuilder.Entity<Consumer>()
                .HasIndex(c => c.Email)
                .IsUnique();

            modelBuilder.Entity<Consumer>()
                .HasIndex(c => c.PhoneNumber)
                .IsUnique();


            modelBuilder.Entity<Reading>()
                .HasIndex(r => new { r.ConsumerId, r.MonthYear })
                .IsUnique();

            modelBuilder.Entity<Bill>()
                .HasIndex(b => new { b.ConsumerId, b.MonthYear })
                .IsUnique();


            modelBuilder.Entity<Consumer>().ToTable(t =>
            {
                t.HasCheckConstraint("CK_Consumer_PhoneNumber_Format", "phone_number ~ '^09[0-9]{9}$'");
            });

            modelBuilder.Entity<Bill>().ToTable(t =>
            {
                t.HasCheckConstraint("CK_Bill_TotalAmount_Positive", "total_amount >= 0");
            });

            modelBuilder.Entity<Payment>().ToTable(t =>
            {
                t.HasCheckConstraint("CK_Payment_AmountPaid_Positive", "amount_paid >= 0");
            });

        }
    }
}
