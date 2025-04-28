namespace BLWSDAI.Models.DTOs
{

    public class MotherMeterReadingCreateDto
    {
        public DateTime MonthYear { get; set; }
        public decimal PresentReading { get; set; }
    }

    public class MotherMeterReadingUpdateDto
    {
        public decimal PresentReading { get; set; }
    }

    public class MotherMeterReadingReadDto
    {
        public int MotherMeterReadingId { get; set; }
        public DateTime MonthYear { get; set; }
        public decimal PresentReading { get; set; }
        public decimal PreviousReading { get; set; }
        public decimal Reading => PresentReading - PreviousReading;
        public DateTime CreatedAt { get; set; }
    }

    public class BaseSystemLossResultDto
    {
        public decimal MotherUsed { get; set; }
        public decimal ConsumerUsed { get; set; }
        public decimal MotherRate { get; set; }
        public decimal? BaseSystemLoss { get; set; }
    }




}
