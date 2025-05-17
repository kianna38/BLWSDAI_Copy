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
            var latestRate = await _context.RatesInfo
                .OrderByDescending(r => r.UpdatedAt)
                .FirstOrDefaultAsync();

            if (latestRate == null) throw new Exception("Rates info not found");

            return new RatesInfoDto
            {
                ConsumerCubicMeterRate = latestRate.ConsumerCubicMeterRate,
                MotherMeterCubicMeterRate = latestRate.MotherMeterCubicMeterRate,
                PenaltyRate = latestRate.PenaltyRate,
                SubsidyRate = latestRate.SubsidyRate,
                ServiceFeeRate = latestRate.ServiceFeeRate,
                UpdatedAt = latestRate.UpdatedAt
            };
        }


        public async Task<RatesInfoDto> UpdateRatesAsync(UpdateRatesInfoDto dto)
        {
            var newRate = new RatesInfo
            {
                ConsumerCubicMeterRate = dto.ConsumerCubicMeterRate,
                MotherMeterCubicMeterRate = dto.MotherMeterCubicMeterRate,
                PenaltyRate = dto.PenaltyRate,
                SubsidyRate = dto.SubsidyRate,
                ServiceFeeRate = dto.ServiceFeeRate,
                UpdatedAt = DateTime.UtcNow
            };

            _context.RatesInfo.Add(newRate);
            await _context.SaveChangesAsync();

            return new RatesInfoDto
            {
                ConsumerCubicMeterRate = newRate.ConsumerCubicMeterRate,
                MotherMeterCubicMeterRate = newRate.MotherMeterCubicMeterRate,
                PenaltyRate = newRate.PenaltyRate,
                SubsidyRate = newRate.SubsidyRate,
                ServiceFeeRate = newRate.ServiceFeeRate,
                UpdatedAt = newRate.UpdatedAt
            };
        }
    }
}
