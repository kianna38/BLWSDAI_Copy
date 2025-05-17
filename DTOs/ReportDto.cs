using BLWSDAI.Models;

namespace BLWSDAI.Models.DTOs
{

    public class GeneralDisconnectionItemDto
    {
        public int ConsumerId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Purok { get; set; } = string.Empty;
        public string MeterNumber { get; set; } = string.Empty;
        public decimal Balance { get; set; }
    }

    public class IndividualDisconnectionReportDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string MeterSerial { get; set; } = string.Empty;
        public string Purok { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string NotificationPreference { get; set; } = string.Empty;

        public List<BillDetailDto> Bills { get; set; } = new();
        public decimal TotalBalance { get; set; }
    }


    public class BillDetailDto
    {
        public string BillingMonth { get; set; } = string.Empty;
        public decimal CubicUsed { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Balance { get; set; }
        public BillStatusEnum Status { get; set; }
    }







    public class IncomeReportDto
    {
        public decimal TotalCollectedMoney { get; set; }
        public decimal MotherMeterBill { get; set; }
        public decimal StaffSalary { get; set; } // total value only
        public decimal OtherExpenses { get; set; }
        public decimal TotalIncome { get; set; }

        public List<OtherExpenseReadDto> OtherExpensesList { get; set; } = new();
        public List<StaffSalaryItemDto> StaffSalaryList { get; set; } = new();
    }


    public class StaffSalaryItemDto
    {
        public string Position { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }



}
