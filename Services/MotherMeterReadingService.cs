using BLWSDAI.Data;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Models;
using Microsoft.EntityFrameworkCore;
using BLWSDAI.Services.Interfaces;

public class MotherMeterReadingService : IMotherMeterReadingService
{
    private readonly ApplicationDbContext _context;

    public MotherMeterReadingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MotherMeterReadingReadDto>> GetAllAsync()
    {
        return await _context.MotherMeterReadings
            .Select(m => new MotherMeterReadingReadDto
            {
                MotherMeterReadingId = m.MotherMeterReadingId,
                MonthYear = m.MonthYear,
                PresentReading = m.PresentReading,
                PreviousReading = m.PreviousReading,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<MotherMeterReadingReadDto?> GetByMonthYearAsync(DateTime monthYear)
    {
        var reading = await _context.MotherMeterReadings
            .Where(m =>
                m.MonthYear.Year == monthYear.Year &&
                m.MonthYear.Month == monthYear.Month &&
                m.MonthYear.Day == 1)
            .FirstOrDefaultAsync();

        return reading == null ? null : new MotherMeterReadingReadDto
        {
            MotherMeterReadingId = reading.MotherMeterReadingId,
            MonthYear = reading.MonthYear,
            PresentReading = reading.PresentReading,
            PreviousReading = reading.PreviousReading,
            CreatedAt = reading.CreatedAt
        };
    }

    public async Task<MotherMeterReadingReadDto?> GetByIdAsync(int id)
    {
        var m = await _context.MotherMeterReadings.FirstOrDefaultAsync(x => x.MotherMeterReadingId == id );
        return m == null ? null : new MotherMeterReadingReadDto
        {
            MotherMeterReadingId = m.MotherMeterReadingId,
            MonthYear = m.MonthYear,
            PresentReading = m.PresentReading,
            PreviousReading = m.PreviousReading,
            CreatedAt = m.CreatedAt
        };
    }

    public async Task<MotherMeterReadingReadDto> CreateOrUpdateAsync(MotherMeterReadingCreateDto dto)
    {
        var monthStart = new DateTime(dto.MonthYear.Year, dto.MonthYear.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Try to find an existing MotherMeterReading for this month
        var existingReading = await _context.MotherMeterReadings
            .FirstOrDefaultAsync(r =>
                r.MonthYear.Year == monthStart.Year &&
                r.MonthYear.Month == monthStart.Month &&
                r.MonthYear.Day == 1);

        if (existingReading != null)
        {
            //  Update logic
            existingReading.PresentReading = dto.PresentReading;

            _context.MotherMeterReadings.Update(existingReading);
            await _context.SaveChangesAsync();

            return new MotherMeterReadingReadDto
            {
                MotherMeterReadingId = existingReading.MotherMeterReadingId,
                MonthYear = existingReading.MonthYear,
                PresentReading = existingReading.PresentReading,
                PreviousReading = existingReading.PreviousReading,
                CreatedAt = existingReading.CreatedAt
            };
        }
        else
        {
            //  Create logic
            var lastReading = await _context.MotherMeterReadings
                .Where(r => r.MonthYear < monthStart)
                .OrderByDescending(r => r.MonthYear)
                .FirstOrDefaultAsync();

            var previous = lastReading?.PresentReading ?? 0;

            var newReading = new MotherMeterReading
            {
                MonthYear = monthStart,
                PresentReading = dto.PresentReading,
                PreviousReading = previous,
                CreatedAt = DateTime.UtcNow
            };

            _context.MotherMeterReadings.Add(newReading);
            await _context.SaveChangesAsync();

            return new MotherMeterReadingReadDto
            {
                MotherMeterReadingId = newReading.MotherMeterReadingId,
                MonthYear = newReading.MonthYear,
                PresentReading = newReading.PresentReading,
                PreviousReading = newReading.PreviousReading,
                CreatedAt = newReading.CreatedAt
            };
        }
    }






    public async Task<BaseSystemLossResultDto?> GetBaseSystemLossAsync(DateTime monthYear)
    {
        var monthStart = new DateTime(monthYear.Year, monthYear.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var consumerReadings = await _context.Readings
            .Where(r => r.MonthYear.Year == monthYear.Year &&
                        r.MonthYear.Month == monthYear.Month &&
                        r.MonthYear.Day == 1)
            .ToListAsync();

        var sumConsumer = consumerReadings.Sum(r => r.PresentReading - r.PreviousReading);
        if (sumConsumer == 0) return null;

        var mother = await _context.MotherMeterReadings
            .FirstOrDefaultAsync(m => m.MonthYear.Year == monthYear.Year &&
                                      m.MonthYear.Month == monthYear.Month &&
                                      m.MonthYear.Day == 1);

        if (mother == null) return null;

        var rates = await _context.RatesInfo
            .OrderByDescending(r => r.UpdatedAt)
            .FirstOrDefaultAsync();

        if (rates == null) return null;

        var motherUsed = mother.PresentReading - mother.PreviousReading;
        var systemLoss = ((motherUsed - sumConsumer) * rates.MotherMeterCubicMeterRate) / sumConsumer;

        return new BaseSystemLossResultDto
        {
            MotherUsed = motherUsed,
            ConsumerUsed = sumConsumer,
            MotherRate = rates.MotherMeterCubicMeterRate,
            BaseSystemLoss = systemLoss
        };
    }

}
