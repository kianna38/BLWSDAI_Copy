using BLWSDAI.Data;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class OtherExpenseService : IOtherExpenseService
{
    private readonly ApplicationDbContext _context;

    public OtherExpenseService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OtherExpenseReadDto>> GetAllAsync()
    {
        return await _context.OtherExpenses
            .OrderByDescending(e => e.Date)
            .Select(e => new OtherExpenseReadDto
            {
                ExpenseId = e.ExpenseId,
                Label = e.Label,
                Amount = e.Amount,
                Date = e.Date,
                UserId = e.UserId
            }).ToListAsync();
    }

    public async Task<OtherExpenseReadDto?> GetByIdAsync(int id)
    {
        var e = await _context.OtherExpenses.FindAsync(id);
        if (e == null) return null;

        return new OtherExpenseReadDto
        {
            ExpenseId = e.ExpenseId,
            Label = e.Label,
            Amount = e.Amount,
            Date = e.Date,
            UserId = e.UserId
        };
    }

    public async Task<OtherExpenseReadDto> CreateAsync(OtherExpenseCreateUpdateDto dto)
    {
        var e = new OtherExpense
        {
            Label = dto.Label,
            Amount = dto.Amount,
            Date = dto.Date,
            UserId = dto.UserId
        };

        _context.OtherExpenses.Add(e);
        await _context.SaveChangesAsync();

        return new OtherExpenseReadDto
        {
            ExpenseId = e.ExpenseId,
            Label = e.Label,
            Amount = e.Amount,
            Date = e.Date,
            UserId = e.UserId
        };
    }


    public async Task<bool> UpdateAsync(int id, OtherExpenseCreateUpdateDto dto)
    {
        var e = await _context.OtherExpenses.FindAsync(id);
        if (e == null) return false;

        e.Label = dto.Label;
        e.Amount = dto.Amount;
        e.Date = dto.Date;
        e.UserId = dto.UserId;

        _context.OtherExpenses.Update(e);
        await _context.SaveChangesAsync();
        return true;
    }


    public async Task<bool> DeleteAsync(int id)
    {
        var e = await _context.OtherExpenses.FindAsync(id);
        if (e == null) return false;

        _context.OtherExpenses.Remove(e);
        await _context.SaveChangesAsync();
        return true;
    }


    public async Task<PaginatedResponse<OtherExpenseReadDto>> FilterAsync(OtherExpenseFilterRequestDto request)
    {
        var query = _context.OtherExpenses.AsQueryable();

        //Filter by created date range
        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            var start = request.StartDate.Value.Date;
            var end = request.EndDate.Value.Date;
            query = query.Where(e => e.Date.Date >= start && e.Date.Date <= end);
        }
        else if (request.StartDate.HasValue)
        {
            var start = request.StartDate.Value.Date;
            query = query.Where(e => e.Date.Date >= start);
        }
        else if (request.EndDate.HasValue)
        {
            var end = request.EndDate.Value.Date;
            query = query.Where(e => e.Date.Date <= end);
        }

        // Filter by label (partial match)
        if (!string.IsNullOrWhiteSpace(request.Label))
        {
            query = query.Where(e => e.Label.Contains(request.Label));
        }

        // Filter by user
        if (request.UserId.HasValue)
        {
            query = query.Where(e => e.UserId == request.UserId);
        }

        // Sort logic
        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            var parts = request.SortBy.Split(':');
            var field = parts[0].ToLower();
            var direction = parts.Length > 1 ? parts[1].ToLower() : "asc";

            query = (field, direction) switch
            {
                ("amount", "asc") => query.OrderBy(e => e.Amount),
                ("amount", "desc") => query.OrderByDescending(e => e.Amount),
                ("date", "asc") => query.OrderBy(e => e.Date),
                _ => query.OrderByDescending(e => e.Date)
            };
        }
        else
        {
            query = query.OrderByDescending(e => e.Date); // default fallback
        }

        var total = await query.CountAsync();

        var data = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new OtherExpenseReadDto
            {
                ExpenseId = e.ExpenseId,
                Label = e.Label,
                Amount = e.Amount,
                Date = e.Date,
                UserId = e.UserId
            })
            .ToListAsync();

        return new PaginatedResponse<OtherExpenseReadDto>
        {
            Data = data,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            TotalCount = total
        };
    }


}
