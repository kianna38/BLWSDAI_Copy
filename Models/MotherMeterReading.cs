using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Models
{
    public class MotherMeterReading
    {
        public int MotherMeterReadingId { get; set; }
        public DateTime MonthYear { get; set; }
        public decimal Reading { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Bill> Bills { get; set; } = new();
    }


}
