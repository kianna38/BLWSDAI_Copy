using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations.Schema;

namespace BLWSDAI.Models
{
    public class SalaryInfo
    {
        public int SalaryInfoId { get; set; }


        [Column(TypeName = "numeric(10,2)")]
        public decimal PresidentSalary { get; set; }


        [Column(TypeName = "numeric(10,2)")]
        public decimal VicePresidentSalary { get; set; }


        [Column(TypeName = "numeric(10,2)")]
        public decimal SecretarySalary { get; set; }


        [Column(TypeName = "numeric(10,2)")]
        public decimal TreasurerSalary { get; set; }


        [Column(TypeName = "numeric(10,2)")]
        public decimal AuditorSalary { get; set; }


        [Column(TypeName = "numeric(10,2)")]
        public decimal MaintenanceOneSalary { get; set; }


        [Column(TypeName = "numeric(10,2)")]
        public decimal MaintenanceTwoSalary { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }


}
