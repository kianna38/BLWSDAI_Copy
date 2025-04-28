using BLWSDAI.Data;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IRatesInfoService _ratesInfoService;

    public PaymentService(ApplicationDbContext context, IRatesInfoService ratesInfoService)
    {
        _context = context;
        _ratesInfoService = ratesInfoService;
    }

    public async Task<PaymentReadDto?> CreatePaymentAsync(PaymentCreateDto dto)
    {
        var bill = await _context.Bills
            .Include(b => b.Consumer)
            .FirstOrDefaultAsync(b => b.BillId == dto.BillId);

        if (bill == null) return null;

        var rates = await _ratesInfoService.GetRatesAsync();
        var today = DateTime.UtcNow;

        decimal penalty = today.Day > 20 ? rates.PenaltyRate : 0;
        int serviceFee = dto.PaymentType == PaymentTypeEnum.Cash ? 0 : (int)Math.Ceiling(bill.TotalAmount / 100);
        decimal totalDue = bill.TotalAmount + penalty + serviceFee;

        bill.Status = dto.AmountPaid >= totalDue ? BillStatusEnum.Paid : BillStatusEnum.Partial;

        var payment = new Payment
        {
            BillId = dto.BillId,
            ConsumerId = bill.ConsumerId,
            UserId = dto.UserId,
            PaymentDate = today,
            Penalty = penalty,
            AmountPaid = dto.AmountPaid,
            PaymentType = dto.PaymentType
        };

        _context.Payments.Add(payment);
        _context.Bills.Update(bill);
        await _context.SaveChangesAsync();

        return new PaymentReadDto
        {
            PaymentId = payment.PaymentId,
            BillId = payment.BillId,
            UserId = payment.UserId,
            AmountPaid = payment.AmountPaid,
            Penalty = payment.Penalty,
            PaymentDate = payment.PaymentDate,
            PaymentType = payment.PaymentType
        };
    }




    public async Task<PaginatedResponse<PaymentReadDto>> GetAllAsync(int page, int pageSize)
    {
        var query = _context.Payments;

        var total = await query.CountAsync();

        var data = await query
            .OrderByDescending(p => p.PaymentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PaymentReadDto
            {
                PaymentId = p.PaymentId,
                BillId = p.BillId,
                UserId = p.UserId,
                AmountPaid = p.AmountPaid,
                Penalty = p.Penalty,
                PaymentDate = p.PaymentDate,
                PaymentType = p.PaymentType
            })
            .ToListAsync();

        return new PaginatedResponse<PaymentReadDto>
        {
            Data = data,
            CurrentPage = page,
            PageSize = pageSize,
            TotalCount = total
        };
    }
    public async Task<PaymentReadDto?> GetPaymentByIdAsync(int id)
    {
        var payment = await _context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PaymentId == id);

        if (payment == null)
        {
            return null;
        }

        return new PaymentReadDto
        {
            PaymentId = payment.PaymentId,
            BillId = payment.BillId,
            UserId = payment.UserId,
            AmountPaid = payment.AmountPaid,
            Penalty = payment.Penalty,
            PaymentDate = payment.PaymentDate,
            PaymentType = payment.PaymentType
        };
    }



    public async Task<PaginatedResponse<PaymentReadDto>> FilterAsync(PaymentFilterRequestDto filter)
    {
        var query = _context.Payments
            .AsQueryable();

        if (filter.UserId.HasValue)
            query = query.Where(p => p.UserId == filter.UserId.Value);

        if (filter.ConsumerId.HasValue)
            query = query.Where(p => p.ConsumerId == filter.ConsumerId.Value);

        if (filter.BillId.HasValue)
            query = query.Where(p => p.BillId == filter.BillId.Value);

        if (filter.MonthYear.HasValue)
        {
            
            var monthStart = new DateTime(filter.MonthYear.Value.Year, filter.MonthYear.Value.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            query = query.Where(p =>
                p.PaymentDate.Year == monthStart.Year &&
                p.PaymentDate.Month == monthStart.Month);
        }

        if (filter.PaymentType.HasValue)
            query = query.Where(p => p.PaymentType == filter.PaymentType.Value);

        if (!string.IsNullOrWhiteSpace(filter.SortBy))
        {
            var parts = filter.SortBy.Split(':');
            var field = parts[0];
            var direction = parts.Length > 1 ? parts[1].ToLower() : "asc";

            query = (field, direction) switch
            {
                ("payment_date", "asc") => query.OrderBy(p => p.PaymentDate),
                ("payment_date", "desc") => query.OrderByDescending(p => p.PaymentDate),
                ("amount_paid", "asc") => query.OrderBy(p => p.AmountPaid),
                ("amount_paid", "desc") => query.OrderByDescending(p => p.AmountPaid),
                _ => query.OrderByDescending(p => p.PaymentDate)
            };
        }

        var total = await query.CountAsync();

        var data = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(p => new PaymentReadDto
            {
                PaymentId = p.PaymentId,
                BillId = p.BillId,
                UserId = p.UserId,
                AmountPaid = p.AmountPaid,
                Penalty = p.Penalty,
                PaymentDate = p.PaymentDate,
                PaymentType = p.PaymentType
            })
            .ToListAsync();

        return new PaginatedResponse<PaymentReadDto>
        {
            Data = data,
            CurrentPage = filter.Page,
            PageSize = filter.PageSize,
            TotalCount = total
        };
    }



    public async Task<bool> DeleteAsync(int paymentId)
    {
        var payment = await _context.Payments
            .Include(p => p.Bill)
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

        if (payment == null)
            return false;

        var bill = payment.Bill;

        _context.Payments.Remove(payment);

        // Force bill status to Unpaid
        bill.Status = BillStatusEnum.Unpaid;
        _context.Bills.Update(bill);

        await _context.SaveChangesAsync();
        return true;
    }



}
