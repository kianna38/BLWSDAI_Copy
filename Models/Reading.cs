using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Models
{
    public class Reading
    {
        public int ReadingId { get; set; }
        public int ConsumerId { get; set; }
        public Consumer Consumer { get; set; } = null!;
        public DateTime MonthYear { get; set; }  // set to 1st of month
        public decimal PresentReading { get; set; }
        public decimal PreviousReading { get; set; }
        public decimal CubicUsed => PresentReading - PreviousReading;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Bill> Bills { get; set; } = new();
    }


}
