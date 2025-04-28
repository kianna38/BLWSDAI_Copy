using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations.Schema;

namespace BLWSDAI.Models
{
    public class OtherExpense
    {
        public int ExpenseId { get; set; }

        public string Label { get; set; } = null!;

        [Column(TypeName = "numeric(10,2)")]
        public decimal Amount { get; set; }

        public DateTime Date { get; set; } 

        public int? UserId { get; set; }
        public User? User { get; set; }
    }

}