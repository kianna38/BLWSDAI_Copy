using BLWSDAI.Data;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }



    public async Task<DashboardOverviewDto> GetDashboardDataAsync(int currentYear, int comparisonYear)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Update this line to count the number of bills for this month, not just active consumers
        int totalBillsThisMonth = await _context.Bills
            .CountAsync(b => b.MonthYear.Year == now.Year && b.MonthYear.Month == now.Month);

        int totalPayments = await _context.Payments
            .CountAsync(p => p.PaymentDate.Year == now.Year && p.PaymentDate.Month == now.Month);

        decimal collectedMoney = await _context.Payments
            .Where(p => p.PaymentDate.Year == now.Year && p.PaymentDate.Month == now.Month)
            .SumAsync(p => p.AmountPaid);

        decimal collectibles = await _context.Bills
            .Where(b => b.MonthYear.Year == now.Year && b.MonthYear.Month == now.Month)
            .SumAsync(b => b.TotalAmount - b.Payments.Sum(p => p.AmountPaid));

        // Monthly income and system loss comparisons
        var incomeCurrent = await GetMonthlyCollectedAsync(currentYear);
        var incomeComparison = await GetMonthlyCollectedAsync(comparisonYear);
        var lossCurrent = await GetMonthlySystemLossAsync(currentYear);
        var lossComparison = await GetMonthlySystemLossAsync(comparisonYear);

        return new DashboardOverviewDto
        {
            TotalPaymentsThisMonth = totalPayments,
            TotalBillsThisMonth = totalBillsThisMonth, // updated
            TotalCollectedMoney = collectedMoney,
            TotalCollectibles = collectibles,
            MonthlyIncomeThisYear = incomeCurrent,
            MonthlyIncomeLastYear = incomeComparison,
            SystemLossThisYear = lossCurrent,
            SystemLossLastYear = lossComparison
        };
    }





    private async Task<List<MonthlyPointDto>> GetMonthlySystemLossAsync(int year)
    {
        var points = new List<MonthlyPointDto>();
        var rates = await _context.RatesInfo.OrderByDescending(r => r.UpdatedAt).FirstOrDefaultAsync();
        if (rates == null) return points;

        for (int m = 1; m <= 12; m++)
        {
            var monthStart = new DateTime(year, m, 1, 0, 0, 0, DateTimeKind.Utc);

            var motherReading = await _context.MotherMeterReadings
                .FirstOrDefaultAsync(mr => mr.MonthYear.Year == year &&
                                           mr.MonthYear.Month == m &&
                                           mr.MonthYear.Day == 1);

            if (motherReading == null)
            {
                points.Add(new MonthlyPointDto { Month = monthStart.ToString("MMM"), Value = 0 });
                continue;
            }

            var motherUsed = motherReading.PresentReading - motherReading.PreviousReading;

            var sumConsumer = await _context.Readings
                .Where(r => r.MonthYear.Year == year &&
                            r.MonthYear.Month == m &&
                            r.MonthYear.Day == 1)
                .SumAsync(r => r.PresentReading - r.PreviousReading);

            if (sumConsumer == 0)
            {
                points.Add(new MonthlyPointDto { Month = monthStart.ToString("MMM"), Value = 0 });
                continue;
            }

            var systemLoss = ((motherUsed - sumConsumer) * rates.MotherMeterCubicMeterRate) / sumConsumer;

            points.Add(new MonthlyPointDto
            {
                Month = monthStart.ToString("MMM"),
                Value = Math.Round(systemLoss, 2)
            });
        }

        return points;
    }

    private async Task<List<MonthlyPointDto>> GetMonthlyCollectedAsync(int year)
    {
        var points = new List<MonthlyPointDto>();
        for (int m = 1; m <= 12; m++)
        {
            decimal total = await _context.Payments
                .Where(p => p.PaymentDate.Year == year && p.PaymentDate.Month == m)
                .SumAsync(p => p.AmountPaid);

            points.Add(new MonthlyPointDto
            {
                Month = new DateTime(year, m, 1).ToString("MMM"),
                Value = total
            });
        }
        return points;
    }


}
