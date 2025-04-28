using BLWSDAI.Data;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BLWSDAI.Services
{
    public class RatesInfoService : IRatesInfoService
{
    private readonly ApplicationDbContext _context;

    public RatesInfoService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RatesInfoDto> GetRatesAsync()
    {
        var rates = await _context.RatesInfo.FirstOrDefaultAsync();
        if (rates == null) throw new Exception("Rates info not found");

        return new RatesInfoDto
        {
            ConsumerCubicMeterRate = rates.ConsumerCubicMeterRate,
            MotherMeterCubicMeterRate = rates.MotherMeterCubicMeterRate,
            PenaltyRate = rates.PenaltyRate,
            SubsidyRate = rates.SubsidyRate,
            UpdatedAt = rates.UpdatedAt
        };
    }

    public async Task<RatesInfoDto> UpdateRatesAsync(UpdateRatesInfoDto dto)
    {
        var rates = await _context.RatesInfo.FirstOrDefaultAsync();
        if (rates == null) throw new Exception("Rates info not found");

        rates.ConsumerCubicMeterRate = dto.ConsumerCubicMeterRate;
        rates.MotherMeterCubicMeterRate = dto.MotherMeterCubicMeterRate;
        rates.PenaltyRate = dto.PenaltyRate;
        rates.SubsidyRate = dto.SubsidyRate;
        rates.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new RatesInfoDto
        {
            ConsumerCubicMeterRate = rates.ConsumerCubicMeterRate,
            MotherMeterCubicMeterRate = rates.MotherMeterCubicMeterRate,
            PenaltyRate = rates.PenaltyRate,
            SubsidyRate = rates.SubsidyRate,
            UpdatedAt = rates.UpdatedAt
        };
    }
}
}
