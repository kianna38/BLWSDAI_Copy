using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations.Schema;

namespace BLWSDAI.Models
{
    public enum PaymentTypeEnum { Cash, Gcash, Maya }

    public class Payment
    {
        public int PaymentId { get; set; }
        public int ConsumerId { get; set; }
        public Consumer Consumer { get; set; } = null!;
        public int BillId { get; set; }
        public Bill Bill { get; set; } = null!;
        public int? UserId { get; set; }
        public User? User { get; set; }


        public DateTime PaymentDate { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal Penalty { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal AmountPaid { get; set; }
        public PaymentTypeEnum PaymentType { get; set; }
    }


}
