namespace BLWSDAI.Models.DTOs
{
    public class SalaryInfoDto
    {
        public decimal PresidentSalary { get; set; }
        public decimal VicePresidentSalary { get; set; }
        public decimal SecretarySalary { get; set; }
        public decimal TreasurerSalary { get; set; }
        public decimal AuditorSalary { get; set; }
        public decimal MaintenanceOneSalary { get; set; }
        public decimal MaintenanceTwoSalary { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateSalaryInfoDto
    {
        public decimal PresidentSalary { get; set; }
        public decimal VicePresidentSalary { get; set; }
        public decimal SecretarySalary { get; set; }
        public decimal TreasurerSalary { get; set; }
        public decimal AuditorSalary { get; set; }
        public decimal MaintenanceOneSalary { get; set; }
        public decimal MaintenanceTwoSalary { get; set; }
    }

}
