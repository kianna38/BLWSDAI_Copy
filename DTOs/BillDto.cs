using BLWSDAI.Models;

namespace BLWSDAI.Models.DTOs
{

    public class BillReadDto
    {
        public int BillId { get; set; }
        public int ConsumerId { get; set; }
        public int ReadingId { get; set; }
        public int? MotherMeterReadingId { get; set; }
        public DateTime MonthYear { get; set; }
        public DateTime BillingDate { get; set; }
        public decimal SystemLoss { get; set; }
        public decimal Subsidy { get; set; }
        public decimal Balance { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = null!;
        public string NotifStatus { get; set; } = null!;
    }

    public class BillFilterRequestDto
    {
        public string? Status { get; set; }
        public string? PaymentType { get; set; }
        public DateTime? MonthYear { get; set; }
        public int? ConsumerId { get; set; }
        public int? ReadingId { get; set; }
        public string? SortBy { get; set; } // e.g. "cubic_used:asc"
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }




}
