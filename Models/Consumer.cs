using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Models
{
    public enum PurokEnum { _1, _2, _3, _4, _5 }
    public enum ConsumerStatusEnum { Active, Disconnected, Cut }
    public enum NotifPrefEnum { Email, SMS,  SMS_and_Email, None }

    public class Consumer
    {
        public int ConsumerId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? MiddleInitial { get; set; }
        public string MeterNumber { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public PurokEnum Purok { get; set; }
        public ConsumerStatusEnum Status { get; set; } = ConsumerStatusEnum.Active;
        public NotifPrefEnum NotifPreference { get; set; } = NotifPrefEnum.Email;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Reading> Readings { get; set; } = new();
        public List<Bill> Bills { get; set; } = new();
        public List<Payment> Payments { get; set; } = new();
    }

}
