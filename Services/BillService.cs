using BLWSDAI.Data;
using BLWSDAI.Models;
using Microsoft.EntityFrameworkCore;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using System;
using BLWSDAI.Services;

public class BillService : IBillService
{
    private readonly ApplicationDbContext _context;
    private readonly IMotherMeterReadingService _motherMeterReadingService;
    private readonly IRatesInfoService _ratesInfoService; 
    private readonly INotificationService _notificationService;
    private readonly IReadingService _readingService;


    public BillService(
        ApplicationDbContext context,
        IMotherMeterReadingService motherMeterReadingService,
        IRatesInfoService ratesInfoService,
        INotificationService notificationService,
        IReadingService readingService) // inject here
    {
        _context = context;
        _motherMeterReadingService = motherMeterReadingService;
        _ratesInfoService = ratesInfoService;
        _notificationService = notificationService;
        _readingService = readingService; // <-- Assign here
    }

    public async Task<List<Bill>> CreateBillsAsync(DateTime monthYear)
    {
        var startOfMonth = DateTime.SpecifyKind(new DateTime(monthYear.Year, monthYear.Month, 1), DateTimeKind.Utc);


        // Validate inputs
        var motherMeterReading = await _context.MotherMeterReadings
            .FirstOrDefaultAsync(m => m.MonthYear == startOfMonth);
        if (motherMeterReading == null) throw new Exception("Mother meter reading not found for this month.");

        //create a mother_meter_reading for next month;

        var consumers = await _context.Consumers
            .Include(c => c.Readings)
            .Include(c => c.Bills).ThenInclude(b => b.Payments)
            .Where(c => c.Status == ConsumerStatusEnum.Active)
            .ToListAsync();

        var rates = await _ratesInfoService.GetRatesAsync();
        var baseSystemLossResult = await _motherMeterReadingService.GetBaseSystemLossAsync(startOfMonth);
        if (baseSystemLossResult == null) throw new Exception("System loss could not be computed.");

        var generalSystemLoss = baseSystemLossResult.BaseSystemLoss;

        var bills = new List<Bill>();

        foreach (var consumer in consumers)
        {
            bool billExists = await _context.Bills
                .AnyAsync(b => b.ConsumerId == consumer.ConsumerId && b.MonthYear == startOfMonth );
            if (billExists) continue;

            var reading = consumer.Readings
                .FirstOrDefault(r => r.MonthYear == startOfMonth );
            if (reading == null) continue;

            var cubicUsed = reading.PresentReading - reading.PreviousReading;
            var subsidy = (cubicUsed < 5 ? cubicUsed : 5) * rates.SubsidyRate;

            decimal balance = 0;
            var previousBill = consumer.Bills
                .Where(b => b.MonthYear < startOfMonth)
                .OrderByDescending(b => b.MonthYear)
                .FirstOrDefault();

            if (previousBill != null)
            {
                if (previousBill.Status == BillStatusEnum.Partial)
                {
                    var totalPaid = previousBill.Payments.Sum(p => p.AmountPaid);
                    balance = previousBill.TotalAmount - totalPaid;
                }
                else if (previousBill.Status == BillStatusEnum.Unpaid)
                {
                    balance = previousBill.TotalAmount + rates.PenaltyRate;
                    previousBill.Status = BillStatusEnum.Overdue;
                }
                else if (previousBill.Status == BillStatusEnum.Overdue)
                {
                    balance = previousBill.TotalAmount + rates.PenaltyRate;
                }
            }

            var systemLoss = generalSystemLoss * cubicUsed;
            var totalAmount = (cubicUsed * rates.ConsumerCubicMeterRate) + balance + systemLoss - subsidy;
            Console.WriteLine($"totalAmount {totalAmount} | cubicUsed {cubicUsed} | balance: {balance} | systemLoss: {systemLoss} | subsidy: {subsidy} | prevstatus: {previousBill?.Status}");

            // Notification values
            int ComputeServiceFee(decimal amount) => (int)Math.Ceiling(amount / 100);
            // Calculate GCash or Maya service fees
            int serviceFee = ComputeServiceFee(totalAmount ?? 0);
            decimal gcashAmount = totalAmount ?? 0 + serviceFee;

            // Late payment amounts
            decimal lateAmount = totalAmount ?? 0 + rates.PenaltyRate;
            int lateServiceFee = ComputeServiceFee(lateAmount);
            decimal lateGcashAmount = lateAmount + lateServiceFee;
           

            string month = startOfMonth.ToString("MMMM yyyy");
            string smsMessage =
                $"BLWSDAI: Your {month} bill is Php{totalAmount:N2}." +
                $"Pay early to avoid Php{rates.PenaltyRate:N0} penalty. Thank you!";

            string emailSubject = $"Your BLWSDAI Water Bill for {month}";
            string emailBody =
                $"Hello {consumer.FirstName},\n\n" +
                $"Your water bill for {month} is ₱{totalAmount:N2}.\n\n" +
                $"Please make your payment on or before the 20th of the month to avoid a ₱{rates.PenaltyRate:N0} late fee.\n\n" +
                $"Pay early to avoid penalties!\n\n" +
                $"— BLWSDAI";

            var newBill = new Bill
            {
                ConsumerId = consumer.ConsumerId,
                ReadingId = reading.ReadingId,
                MotherMeterReadingId = motherMeterReading.MotherMeterReadingId,
                MonthYear = startOfMonth,
                BillingDate = DateTime.UtcNow,
                SystemLoss = Math.Round(systemLoss ?? 0, 2),
                Subsidy = Math.Round(subsidy, 2),
                Balance = Math.Round(balance, 2),
                TotalAmount = Math.Round(totalAmount ?? 0, 2),
                Status = BillStatusEnum.Unpaid,
                NotifStatus = "Pending"
            };

            try
            {
                await _notificationService.NotifyAsync(consumer, emailSubject, emailBody, smsMessage);
                newBill.NotifStatus = "Sent";
            }
            catch (Exception ex)
            {
                // Log error if needed
                newBill.NotifStatus = "Failed";
            }

            bills.Add(newBill);
            _context.Bills.Add(newBill);
        }

        await _context.SaveChangesAsync();

        await _motherMeterReadingService.CreateOrUpdateAsync(new MotherMeterReadingCreateDto
        {
            MonthYear = startOfMonth.AddMonths(1),
            PresentReading = 0
        });

        return bills;
    }

    public async Task<BillReadDto?> GetBillByIdAsync(int billId)
    {
        var bill = await _context.Bills
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.BillId == billId);

        return bill == null ? null : new BillReadDto
        {
            BillId = bill.BillId,
            ConsumerId = bill.ConsumerId,
            ReadingId = bill.ReadingId,
            MotherMeterReadingId = bill.MotherMeterReadingId,
            MonthYear = bill.MonthYear,
            BillingDate = bill.BillingDate,
            SystemLoss = bill.SystemLoss,
            Subsidy = bill.Subsidy,
            Balance = bill.Balance,
            TotalAmount = bill.TotalAmount,
            Status = bill.Status.ToString(),
            NotifStatus = bill.NotifStatus
        };
    }


    public async Task<PaginatedResponse<BillReadDto>> GetBillsByMonthYearAsync(DateTime monthYear, int page = 1, int pageSize = 20)
    {
        var query = _context.Bills
            .Where(b => b.MonthYear.Year == monthYear.Year &&
                        b.MonthYear.Month == monthYear.Month &&
                        b.MonthYear.Day == 1); // Only bills for the exact first day of month

        var totalCount = await query.CountAsync();

        var paged = await query
            .OrderBy(b => b.BillId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<BillReadDto>
        {
            Data = paged.Select(b => new BillReadDto
            {
                BillId = b.BillId,
                ConsumerId = b.ConsumerId,
                ReadingId = b.ReadingId,
                MotherMeterReadingId = b.MotherMeterReadingId,
                MonthYear = b.MonthYear,
                BillingDate = b.BillingDate,
                SystemLoss = b.SystemLoss,
                Subsidy = b.Subsidy,
                Balance = b.Balance,
                TotalAmount = b.TotalAmount,
                Status = b.Status.ToString(),
                NotifStatus = b.NotifStatus
            }).ToList(),
            CurrentPage = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PaginatedResponse<BillReadDto>> FilterBillsAsync(BillFilterRequestDto filter)
    {
        var query = _context.Bills
            .Include(b => b.Reading)
            .Include(b => b.Payments)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.Status) &&
            Enum.TryParse<BillStatusEnum>(filter.Status, true, out var parsedStatus))
            query = query.Where(b => b.Status == parsedStatus);

        if (!string.IsNullOrEmpty(filter.PaymentType))
            query = query.Where(b =>
                b.Payments.Any(p => p.PaymentType.ToString().Equals(filter.PaymentType, StringComparison.OrdinalIgnoreCase)));

        if (filter.ConsumerId.HasValue)
            query = query.Where(b => b.ConsumerId == filter.ConsumerId.Value);

        if (filter.ReadingId.HasValue)
            query = query.Where(b => b.ReadingId == filter.ReadingId.Value);

        if (filter.MonthYear.HasValue)
        {            
            var date = DateTime.SpecifyKind(new DateTime(filter.MonthYear.Value.Year, filter.MonthYear.Value.Month, 1), DateTimeKind.Utc);
            query = query.Where(b => b.MonthYear == date);
        }

        // Sorting
        if (!string.IsNullOrWhiteSpace(filter.SortBy))
        {
            var sortParts = filter.SortBy.Split(':');
            var field = sortParts[0];
            var direction = sortParts.Length > 1 ? sortParts[1].ToLower() : "asc";

            query = (field, direction) switch
            {
                ("month_year", "asc") => query.OrderBy(b => b.MonthYear),
                ("month_year", "desc") => query.OrderByDescending(b => b.MonthYear),

                ("cubic_used", "asc") => query.OrderBy(b => b.Reading.PresentReading - b.Reading.PreviousReading),
                ("cubic_used", "desc") => query.OrderByDescending(b => b.Reading.PresentReading - b.Reading.PreviousReading),

                ("total_amount", "asc") => query.OrderBy(b => b.TotalAmount),
                ("total_amount", "desc") => query.OrderByDescending(b => b.TotalAmount),

                ("amount_paid", "asc") => query.OrderBy(b => b.Payments.Sum(p => p.AmountPaid)),
                ("amount_paid", "desc") => query.OrderByDescending(b => b.Payments.Sum(p => p.AmountPaid)),

                _ => query.OrderByDescending(b => b.BillingDate)
            };
        }

        var totalCount = await query.CountAsync();

        var data = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(b => new BillReadDto
            {
                BillId = b.BillId,
                ConsumerId = b.ConsumerId,
                ReadingId = b.ReadingId,
                MotherMeterReadingId = b.MotherMeterReadingId,
                MonthYear = b.MonthYear,
                BillingDate = b.BillingDate,
                SystemLoss = b.SystemLoss,
                Subsidy = b.Subsidy,
                Balance = b.Balance,
                TotalAmount = b.TotalAmount,
                Status = b.Status.ToString(),
                NotifStatus = b.NotifStatus
            })
            .ToListAsync();

        return new PaginatedResponse<BillReadDto>
        {
            Data = data,
            CurrentPage = filter.Page,
            PageSize = filter.PageSize,
            TotalCount = totalCount
        };
    }


    public async Task<bool> DeleteBillAsync(DateTime monthYear)
    {
        var startOfMonth = new DateTime(monthYear.Year, monthYear.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Step 1: Get all bills in the same month
        var billsSameMonth = await _context.Bills
            .Include(b => b.Payments)
            .Where(b => b.MonthYear.Year == startOfMonth.Year &&
                        b.MonthYear.Month == startOfMonth.Month &&
                        b.MonthYear.Day == 1)
            .ToListAsync();

        if (!billsSameMonth.Any())
            return false; // No bills to delete

        // Step 2: Check if any bill has payment
        bool anyBillHasPayment = billsSameMonth.Any(b => b.Payments.Any());
        if (anyBillHasPayment)
            return false; // Do not delete if payments exist

        // Step 3: Delete the MotherMeterReading for NEXT month
        var nextMonth = startOfMonth.AddMonths(1);
        var nextMonthReading = await _context.MotherMeterReadings
            .FirstOrDefaultAsync(m => m.MonthYear.Year == nextMonth.Year &&
                                      m.MonthYear.Month == nextMonth.Month &&
                                      m.MonthYear.Day == 1);

        if (nextMonthReading != null)
        {
            _context.MotherMeterReadings.Remove(nextMonthReading);
        }

        // Step 4: Collect all ReadingIds linked to the bills
        //var readingIds = billsSameMonth
        //    .Select(b => b.ReadingId)
        //    .Distinct()
        //    .ToList();

        // Step 5: Delete all the bills first
        _context.Bills.RemoveRange(billsSameMonth);
        await _context.SaveChangesAsync(); // Commit bill deletion first

        //// Step 6: Now, delete readings
        //foreach (var readingId in readingIds)
        //{
        //    await _readingService.DeleteAsync(readingId);
        //}

        return true;
    }





}
