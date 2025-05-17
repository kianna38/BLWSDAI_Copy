using BLWSDAI.Data;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;
    private readonly ISalaryInfoService _salaryInfoService;
    private readonly IRatesInfoService _ratesInfoService;
    private readonly INotificationService _notificationService;

    public ReportService(
        ApplicationDbContext context,
        ISalaryInfoService salaryInfoService,
        IRatesInfoService ratesInfoService,
        INotificationService notificationService)
    {
        _context = context;
        _salaryInfoService = salaryInfoService;
        _ratesInfoService = ratesInfoService;
        _notificationService = notificationService;
    }

    private async Task<Dictionary<DateTime, SalaryInfo>> GetMonthlySalariesAsync(DateTime startDate, DateTime endDate)
    {
        var salaryInfos = await _context.SalaryInfos
            .Where(s => s.UpdatedAt <= endDate)
            .OrderBy(s => s.UpdatedAt)
            .ToListAsync();

        var monthlySalaries = new Dictionary<DateTime, SalaryInfo>();

        for (var month = new DateTime(startDate.Year, startDate.Month, 1); month <= endDate; month = month.AddMonths(1))
        {
            // Use the latest salary info that was updated on or before the END of the current month
            var effectiveSalary = salaryInfos
                .Where(s => s.UpdatedAt.Year < month.Year ||
                           (s.UpdatedAt.Year == month.Year && s.UpdatedAt.Month <= month.Month))
                .OrderByDescending(s => s.UpdatedAt)
                .FirstOrDefault();

            if (effectiveSalary != null)
            {
                monthlySalaries[month] = effectiveSalary;
            }
        }

        return monthlySalaries;
    }



    public async Task<IncomeReportDto> GenerateIncomeReportAsync(DateTime startMonth, DateTime endMonth)
    {
        var startDate = new DateTime(startMonth.Year, startMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(endMonth.Year, endMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1).AddDays(-1);



        decimal totalCollected = await _context.Payments
            .Where(p =>  p.PaymentDate >= startDate && p.PaymentDate <= endDate)
            .SumAsync(p => p.AmountPaid);

        var rates = await _ratesInfoService.GetRatesAsync();
        var motherReadings = await _context.MotherMeterReadings
            .Where(m =>  m.MonthYear >= startDate && m.MonthYear <= endDate)
            .ToListAsync();

        decimal totalMotherBill = motherReadings
            .Sum(m => (m.PresentReading - m.PreviousReading) * rates.MotherMeterCubicMeterRate);

        var monthlySalaries = await GetMonthlySalariesAsync(startDate, endDate);
        decimal totalStaffSalary = 0;

        var staffSalaryList = new List<StaffSalaryItemDto>();

        foreach (var salary in monthlySalaries.Values)
        {
            var breakdown = new List<StaffSalaryItemDto>
            {
                new StaffSalaryItemDto { Position = "President", Amount = salary.PresidentSalary },
                new StaffSalaryItemDto { Position = "Vice-President", Amount = salary.VicePresidentSalary },
                new StaffSalaryItemDto { Position = "Secretary", Amount = salary.SecretarySalary },
                new StaffSalaryItemDto { Position = "Treasurer", Amount = salary.TreasurerSalary },
                new StaffSalaryItemDto { Position = "Auditor", Amount = salary.AuditorSalary },
                new StaffSalaryItemDto { Position = "Maintenance 1", Amount = salary.MaintenanceOneSalary },
                new StaffSalaryItemDto { Position = "Maintenance 2", Amount = salary.MaintenanceTwoSalary }
            };

            totalStaffSalary += breakdown.Sum(s => s.Amount);

            foreach (var s in breakdown)
            {
                var existing = staffSalaryList.FirstOrDefault(x => x.Position == s.Position);
                if (existing != null)
                    existing.Amount += s.Amount;
                else
                    staffSalaryList.Add(new StaffSalaryItemDto { Position = s.Position, Amount = s.Amount });
            }
        }


        var otherExpensesList = await _context.OtherExpenses
            .Where(e => e.Date >= startDate && e.Date <= endDate)
            .OrderByDescending(e => e.Date)
            .Select(e => new OtherExpenseReadDto
            {
                ExpenseId = e.ExpenseId,
                Label = e.Label,
                Amount = e.Amount,
                Date = e.Date,
                UserId = e.UserId
            })
            .ToListAsync();

        decimal totalOtherExpenses = otherExpensesList.Sum(e => e.Amount);
        decimal totalIncome = totalCollected - (totalMotherBill + totalStaffSalary + totalOtherExpenses);

        return new IncomeReportDto
        {
            TotalCollectedMoney = totalCollected,
            MotherMeterBill = totalMotherBill,
            StaffSalary = totalStaffSalary,
            OtherExpenses = totalOtherExpenses,
            TotalIncome = totalIncome,
            StaffSalaryList = staffSalaryList,
            OtherExpensesList = otherExpensesList
        };
    }



    public async Task<List<GeneralDisconnectionItemDto>> GetGeneralDisconnectionReportAsync(DateTime asOfMonth)
    {
        var monthStart = new DateTime(asOfMonth.Year, asOfMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var report = await _context.Consumers
            .Where(c => c.Status == ConsumerStatusEnum.Active)
            .Select(c => new
            {
                c.ConsumerId,
                c.FirstName,
                c.LastName,
                c.Purok,
                c.MeterNumber,
                LatestUnpaidBill = c.Bills
                    .Where(b => b.Status != BillStatusEnum.Paid && b.MonthYear <= monthStart)
                    .OrderByDescending(b => b.MonthYear)
                    .Select(b => b.TotalAmount)
                    .FirstOrDefault()
            })
            .Where(r => r.LatestUnpaidBill > 1000)
            .OrderBy(r => r.Purok)
            .Select(r => new GeneralDisconnectionItemDto
            {
                ConsumerId = r.ConsumerId,
                FirstName = r.FirstName,
                LastName = r.LastName,
                Purok = r.Purok.ToString(),
                MeterNumber = r.MeterNumber,
                Balance = r.LatestUnpaidBill
            })
            .ToListAsync();

        return report;
    }


    public async Task<IndividualDisconnectionReportDto> GetIndividualDisconnectionReportAsync(int consumerId)
    {
        var consumer = await _context.Consumers
            .Include(c => c.Bills)
                .ThenInclude(b => b.Payments)
            .Include(c => c.Bills)
                .ThenInclude(b => b.Reading)
            .FirstOrDefaultAsync(c => c.ConsumerId == consumerId && c.Status == ConsumerStatusEnum.Active);

        if (consumer == null)
            throw new Exception("Consumer not found or inactive.");

        // Get latest paid bill's month (cutoff)
        var cutoff = consumer.Bills
            .Where(b => b.Status == BillStatusEnum.Paid)
            .OrderByDescending(b => b.MonthYear)
            .Select(b => b.MonthYear)
            .FirstOrDefault();

        // Get due bills after cutoff
        var dueBillsRaw = consumer.Bills
            .Where(b =>
                (b.Status == BillStatusEnum.Unpaid || b.Status == BillStatusEnum.Partial || b.Status == BillStatusEnum.Overdue) &&
                (cutoff == default || b.MonthYear > cutoff))
            .OrderBy(b => b.MonthYear)
            .ToList();

        // Get latest unpaid bill (most recent)
        var latestUnpaid = dueBillsRaw.OrderByDescending(b => b.MonthYear).FirstOrDefault();

        var dueBills = dueBillsRaw.Select(b => new BillDetailDto
        {
            BillingMonth = b.MonthYear.ToString("MMMM yyyy"),
            CubicUsed = b.Reading.PresentReading - b.Reading.PreviousReading,
            TotalAmount = b.TotalAmount,
            Balance = b.Balance,
            Status = b.Status
        }).ToList();

        return new IndividualDisconnectionReportDto
        {
            FirstName = consumer.FirstName,
            LastName = consumer.LastName,
            MeterSerial = consumer.MeterNumber,
            Purok = consumer.Purok.ToString(),
            Email = consumer.Email ?? "N/A",
            PhoneNumber = consumer.PhoneNumber ?? "N/A",
            NotificationPreference = consumer.NotifPreference.ToString(),
            Bills = dueBills,
            TotalBalance = latestUnpaid?.TotalAmount ?? 0
        };
    }


    public async Task SendDisconnectionNoticeAsync(int consumerId)
    {
        var consumer = await _context.Consumers
            .Include(c => c.Bills)
                .ThenInclude(b => b.Payments)
            .FirstOrDefaultAsync(c => c.ConsumerId == consumerId && c.Status == ConsumerStatusEnum.Active);

        if (consumer == null)
            throw new Exception("Consumer not found or inactive.");

        // Calculate the total unpaid balance
        decimal totalBalance = consumer.Bills
            .Where(b => b.Status == BillStatusEnum.Overdue || b.Status == BillStatusEnum.Partial || b.Status == BillStatusEnum.Unpaid)
            .Sum(b => b.TotalAmount - b.Payments.Sum(p => p.AmountPaid));

        if (totalBalance <= 0)
            throw new Exception("Consumer has no outstanding balance.");

        string smsMessage = $"BLWSDAI: Your outstanding balance is ₱{totalBalance:N2}. Please pay to avoid disconnection. Thank you.";
        string emailSubject = "BLWSDAI Disconnection Notice";
        string emailBody = $"Hello {consumer.FirstName},\n\n" +
                           $"This is a reminder that your outstanding water bill balance is ₱{totalBalance:N2}.\n\n" +
                           $"Please settle your account promptly to avoid disconnection of service.\n\n" +
                           $"- BLWSDAI";

        try
        {
            await _notificationService.NotifyAsync(consumer, emailSubject, emailBody, smsMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send disconnection notification to {consumer.ConsumerId}: {ex.Message}");
        }
    }

}
