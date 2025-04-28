namespace BLWSDAI.Models.DTOs
{
    public class UserCreateDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public UserRoleEnum Role { get; set; }
    }

    public class UserReadDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public UserRoleEnum Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserLoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class UserFilterDto
    {
        public List<UserRoleEnum>? Roles { get; set; }

        public string? SortBy { get; set; } = "createdAt"; // default
        public string SortDir { get; set; } = "asc";       // default

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class UserLogDto
    {
        public int ProcessID { get; set; }
        public string Process { get; set; } = string.Empty; // e.g. "Payment", "Other Expense"
        public DateTime Date { get; set; }
        public string Details { get; set; } = string.Empty;
    }

    public class UserLogFilterDto
    {
        public int UserId { get; set; }
        public string? Process { get; set; } // "Payment", "Other Expense", or null (all)
        public string SortDir { get; set; } = "desc"; // "asc" or "desc"
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }


}
