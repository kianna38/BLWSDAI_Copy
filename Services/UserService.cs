using BLWSDAI.Data;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Models;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResponse<UserReadDto>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        var query = _context.Users;
        var total = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.UserId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<UserReadDto>
        {
            CurrentPage = page,
            PageSize = pageSize,
            TotalCount = total,
            Data = users.Select(u => new UserReadDto
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            }).ToList()
        };
    }

    public async Task<PaginatedResponse<UserReadDto>> FilterAsync(UserFilterDto filter)
    {
        var query = _context.Users.AsQueryable();

        if (filter.Roles != null && filter.Roles.Any())
            query = query.Where(u => filter.Roles.Contains(u.Role));

        bool desc = filter.SortDir.ToLower() == "desc";
        query = filter.SortBy?.ToLower() switch
        {
            "name" => desc ? query.OrderByDescending(u => u.Name) : query.OrderBy(u => u.Name),
            "createdat" => desc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => query.OrderBy(u => u.UserId)
        };

        var total = await query.CountAsync();
        var paged = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PaginatedResponse<UserReadDto>
        {
            CurrentPage = filter.Page,
            PageSize = filter.PageSize,
            TotalCount = total,
            Data = paged.Select(u => new UserReadDto
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            }).ToList()
        };
    }

    public async Task<UserReadDto?> GetByIdAsync(int id)
    {
        var user = await _context.Users
            .Where(u => u.UserId == id) 
            .FirstOrDefaultAsync();

        return user == null ? null : new UserReadDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserReadDto> CreateAsync(UserCreateDto dto)
    {
        bool emailExists = await _context.Users
            .AnyAsync(u => u.Email == dto.Email ); 

        if (emailExists)
            throw new Exception("A user with this email already exists.");

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = hashedPassword,
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserReadDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> UpdateAsync(int id, UserCreateDto dto)
    {
        var user = await _context.Users
            .Where(u => u.UserId == id)
            .FirstOrDefaultAsync();

        if (user == null) return false;

        bool emailTakenByAnother = await _context.Users
            .AnyAsync(u => u.Email == dto.Email && u.UserId != id);

        if (emailTakenByAnother)
            throw new Exception("Another user with this email already exists.");

        user.Name = dto.Name;
        user.Email = dto.Email;

        // Only hash and update if not empty or null
        if (!string.IsNullOrWhiteSpace(dto.PasswordHash))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);
        }

        user.Role = dto.Role;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return true;
    }


    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        // Hard delete the user
        _context.Users.Remove(user);

        // Save the changes to apply the deletion
        await _context.SaveChangesAsync();
        return true;
    }


    public async Task<UserReadDto?> LoginAsync(UserLoginDto dto)
    {
        var user = await _context.Users
            .Where(u => u.Email == dto.Email)
            .FirstOrDefaultAsync();

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return new UserReadDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<PaginatedResponse<UserLogDto>> GetUserLogsAsync(UserLogFilterDto filter)
    {
        var logs = new List<UserLogDto>();

        // Fetch Payments
        if (string.IsNullOrWhiteSpace(filter.Process) || filter.Process.Equals("Payment", StringComparison.OrdinalIgnoreCase))
        {
            var payments = await _context.Payments
                .Where(p => p.UserId == filter.UserId)
                .Include(p => p.Bill).ThenInclude(b => b.Consumer)
                .Select(p => new UserLogDto
                {
                    ProcessID = p.Bill.Consumer.ConsumerId,
                    Process = "Payment",
                    Date = p.PaymentDate,
                    Details = $"{p.Bill.Consumer.LastName}, {p.Bill.Consumer.FirstName} {p.Bill.MonthYear:MMMM yyyy} Bill Payment"
                })
                .ToListAsync();

            logs.AddRange(payments);
        }

        // Fetch Other Expenses
        if (string.IsNullOrWhiteSpace(filter.Process) || filter.Process.Equals("Other Expense", StringComparison.OrdinalIgnoreCase))
        {
            var expenses = await _context.OtherExpenses
                .Where(e => e.UserId == filter.UserId)
                .Select(e => new UserLogDto
                {
                    ProcessID = e.ExpenseId,
                    Process = "Other Expense",
                    Date = e.Date,
                    Details = $"Added {e.Label} - Php {e.Amount:N0}"
                })
                .ToListAsync();

            logs.AddRange(expenses);
        }

        // Apply sorting BEFORE pagination
        bool desc = filter.SortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
        logs = desc
            ? logs.OrderByDescending(l => l.Date).ToList()
            : logs.OrderBy(l => l.Date).ToList();

        //  Now apply pagination
        int totalCount = logs.Count;
        var paged = logs
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return new PaginatedResponse<UserLogDto>
        {
            Data = paged,
            CurrentPage = filter.Page,
            PageSize = filter.PageSize,
            TotalCount = totalCount
        };
    }


    public async Task<bool> ResetPasswordToRoleNameEmailFormatAsync(string email)
    {
        var user = await _context.Users
            .Where(u => u.Email == email)
            .FirstOrDefaultAsync();

        if (user == null) return false;

        // Remove spaces from name
        var nameNoSpaces = user.Name.Replace(" ", "");

        // Construct new password
        var newPassword = $"{user.Role}.{nameNoSpaces}.{user.Email}";

        // Hash and update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return true;
    }




}
