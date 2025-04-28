using BLWSDAI.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace BLWSDAI.Models
{

    public enum BillStatusEnum { Unpaid, Partial, Overdue, Paid }

    public class Bill
    {
        public int BillId { get; set; }
        public int ConsumerId { get; set; }
        public Consumer Consumer { get; set; } = null!;
        public int ReadingId { get; set; }
        public Reading Reading { get; set; } = null!;
        public int? MotherMeterReadingId { get; set; }
        public MotherMeterReading? MotherMeterReading { get; set; }

        public DateTime MonthYear { get; set; }
        public DateTime BillingDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "numeric(10,2)")]
        public decimal SystemLoss { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal Subsidy { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal Balance { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal TotalAmount { get; set; }
        public BillStatusEnum Status { get; set; } = BillStatusEnum.Unpaid;
        public string NotifStatus { get; set; } = null!;


        public List<Payment> Payments { get; set; } = new();
    }
}
