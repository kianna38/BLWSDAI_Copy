namespace BLWSDAI.Models.DTOs
{

    public class ConsumerReadDto
    {
        public int ConsumerId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? MiddleInitial { get; set; }
        public string MeterNumber { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Email { get; set; } = null!;

        public PurokEnum Purok { get; set; }
        public ConsumerStatusEnum Status { get; set; }
        public NotifPrefEnum NotifPreference { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ConsumerCreateUpdateDto
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? MiddleInitial { get; set; }
        public string MeterNumber { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Email { get; set; } = null!;

        public PurokEnum Purok { get; set; }
        public ConsumerStatusEnum Status { get; set; } = ConsumerStatusEnum.Active;
        public NotifPrefEnum NotifPreference { get; set; } = NotifPrefEnum.Email;
    }

    public class ConsumerFilterDto
    {
        public List<PurokEnum>? Puroks { get; set; }
        public List<ConsumerStatusEnum>? Statuses { get; set; }
        public List<NotifPrefEnum>? NotifPreferences { get; set; }

        public string? SortBy { get; set; } = "createdAt";
        public string SortDir { get; set; } = "asc";

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class ConsumerBillPaymentFilterDto
    {
        public int? ConsumerId { get; set; }
        public DateTime? MonthYear { get; set; }
        public string? PaymentType { get; set; }
        public string? Status { get; set; }
        public string? Purok { get; set; }
        public string? SortBy { get; set; }  // Sorting field (lastName, totalAmount, cubicUsed)
        public string? SortDir { get; set; } // Sorting direction (asc or desc)
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class ConsumerBillPaymentDto
    {
        public int ConsumerId { get; set; }
        public int ReadingId { get; set; }
        public int BillId { get; set; }
        public int? PaymentId { get; set; }  // If there's a connected payment

        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Purok { get; set; } = null!;  // Purok as a string

        public DateTime MonthYear { get; set; }  // Common MonthYear for Reading and Bill
        public decimal CubicUsed { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Balance { get; set; }
        public decimal Subsidy { get; set; }
        public decimal SystemLoss { get; set; }

        public DateTime? PaymentDate { get; set; }
        public string Status { get; set; } = null!;
        public decimal? Penalty { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentType { get; set; } = null!;
        public string NotifStatus { get; set; } = null!;

       
    }


}
