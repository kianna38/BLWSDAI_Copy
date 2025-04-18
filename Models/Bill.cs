using BLWSDAI.Models;

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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }

    public decimal SystemLoss { get; set; }
    public decimal Subsidy { get; set; }
    public decimal Penalty { get; set; }
    public decimal Balance { get; set; }
    public decimal TotalAmount { get; set; }

    public BillStatusEnum Status { get; set; } = BillStatusEnum.Unpaid;

    public List<Payment> Payments { get; set; } = new();
}
