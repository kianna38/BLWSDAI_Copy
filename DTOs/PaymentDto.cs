namespace BLWSDAI.Models.DTOs
{
    public class PaymentCreateDto
    {
        public int BillId { get; set; }
        public int? UserId { get; set; } // Who processed the payment
        public decimal AmountPaid { get; set; }
        public PaymentTypeEnum PaymentType { get; set; }
    }

    public class PaymentReadDto
    {
        public int PaymentId { get; set; }
        public int BillId { get; set; }
        public int? UserId { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal Penalty { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentTypeEnum PaymentType { get; set; }
    }


    public class PaymentFilterRequestDto
    {
        public int? UserId { get; set; }
        public int? ConsumerId { get; set; }
        public int? BillId { get; set; }
        public DateTime? MonthYear { get; set; }
        public PaymentTypeEnum? PaymentType { get; set; }
        public string? SortBy { get; set; } = "payment_date:desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
