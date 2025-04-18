using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Models
{
    public class SalaryInfo
    {
        public int SalaryInfoId { get; set; } = 1;
        public decimal PresidentSalary { get; set; }
        public decimal VicePresidentSalary { get; set; }
        public decimal SecretarySalary { get; set; }
        public decimal TreasurerSalary { get; set; }
        public decimal AuditorSalary { get; set; }
        public decimal Maintenance1Salary { get; set; }
        public decimal Maintenance2Salary { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }


}
