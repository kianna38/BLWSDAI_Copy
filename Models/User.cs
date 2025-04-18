using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Models
{
    public enum UserRoleEnum { Admin, Staff }

    public class User
    {
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public UserRoleEnum Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Payment> Payments { get; set; } = new();
    }


}
