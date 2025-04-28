using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations.Schema;

namespace BLWSDAI.Models
{
    public class Reading
    {
        public int ReadingId { get; set; }
        public int ConsumerId { get; set; }
        public Consumer Consumer { get; set; } = null!;
        public DateTime MonthYear { get; set; }  // set to 1st of month
        public DateTime ReadingDate { get; set; } = DateTime.UtcNow;


        [Column(TypeName = "numeric(10,2)")]
        public decimal PresentReading { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal PreviousReading { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal CubicUsed => PresentReading - PreviousReading;

        public List<Bill> Bills { get; set; } = new();
    }


}
