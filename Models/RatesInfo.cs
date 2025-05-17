using BLWSDAI.Models;
using System.ComponentModel.DataAnnotations.Schema;

public class RatesInfo
{
    public int RatesInfoId { get; set; }


    [Column(TypeName = "numeric(10,2)")]
    public decimal ConsumerCubicMeterRate { get; set; }


    [Column(TypeName = "numeric(10,2)")]
    public decimal MotherMeterCubicMeterRate { get; set; }


    [Column(TypeName = "numeric(10,2)")]
    public decimal PenaltyRate { get; set; }


    [Column(TypeName = "numeric(10,2)")]
    public decimal SubsidyRate { get; set; }


    [Column(TypeName = "numeric(10,2)")]
    public decimal ServiceFeeRate { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
