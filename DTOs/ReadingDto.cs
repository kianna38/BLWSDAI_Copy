namespace BLWSDAI.Models.DTOs
{
    public class ReadingDto
    {
        public int ReadingId { get; set; }
        public int ConsumerId { get; set; }
        public DateTime MonthYear { get; set; }
        public DateTime ReadingDate { get; set; }
        public decimal PresentReading { get; set; }
        public decimal PreviousReading { get; set; }
        public decimal CubicUsed => PresentReading - PreviousReading;
        public DateTime CreatedAt { get; set; }
    }

    public class ReadingUpdateDto
    {
        public decimal PresentReading { get; set; }
    }


    public class ReadingCreateDto
    {
        public int ConsumerId { get; set; }
        public DateTime MonthYear { get; set; }
        public decimal PresentReading { get; set; }
    }

    public class ReadingFilterDto
    {
        public List<PurokEnum>? Puroks { get; set; }
        public DateTime MonthYear { get; set; }
        public string? SortBy { get; set; } = "lastname";
        public string SortDir { get; set; } = "asc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class ReadingSummaryDto
    {
        public bool billGenerated { get; set; }
        public int numOfActiveConsumers { get; set; }
        public int numOfReadings { get; set; }
        public decimal SumOfPresentReading { get; set; }
        public decimal SumOfPreviousReading { get; set; }
        public decimal TotalConsumerReading => SumOfPresentReading - SumOfPreviousReading;
    }

}
