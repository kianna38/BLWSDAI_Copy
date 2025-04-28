using BLWSDAI.Models;

namespace BLWSDAI.Models.DTOs
{

    public class RatesInfoDto
    {
        public decimal ConsumerCubicMeterRate { get; set; }
        public decimal MotherMeterCubicMeterRate { get; set; }
        public decimal PenaltyRate { get; set; }
        public decimal SubsidyRate { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateRatesInfoDto
    {
        public decimal ConsumerCubicMeterRate { get; set; }
        public decimal MotherMeterCubicMeterRate { get; set; }
        public decimal PenaltyRate { get; set; }
        public decimal SubsidyRate { get; set; }
    }



}
