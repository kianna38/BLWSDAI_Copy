using BLWSDAI.Models;

namespace BLWSDAI.Models.DTOs
{

    public class DashboardOverviewDto
    {
        public int TotalPaymentsThisMonth { get; set; }
        public int TotalBillsThisMonth { get; set; }
        public decimal TotalCollectedMoney { get; set; }
        public decimal TotalCollectibles { get; set; }
        public List<MonthlyPointDto> MonthlyIncomeThisYear { get; set; } = new();
        public List<MonthlyPointDto> MonthlyIncomeLastYear { get; set; } = new();
        public List<MonthlyPointDto> SystemLossThisYear { get; set; } = new();
        public List<MonthlyPointDto> SystemLossLastYear { get; set; } = new();
    }


    public class MonthlyPointDto
    {
        public string Month { get; set; } = string.Empty; // e.g. "Jan"
        public decimal Value { get; set; }
    }



}
