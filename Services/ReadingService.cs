using BLWSDAI.Data;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BLWSDAI.Services
{
    public class ReadingService : IReadingService
    {
        private readonly ApplicationDbContext _context;
        public ReadingService(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<ReadingDto>> GetAllAsync()
        {
            return await _context.Readings
                .Select(r => new ReadingDto
                {
                    ReadingId = r.ReadingId,
                    ConsumerId = r.ConsumerId,
                    MonthYear = r.MonthYear,
                    ReadingDate = r.ReadingDate,
                    PresentReading = r.PresentReading,
                    PreviousReading = r.PreviousReading
                })
                .ToListAsync();
        }

        public async Task<ReadingDto?> GetByIdAsync(int id)
        {
            var r = await _context.Readings
                .Where(r => r.ReadingId == id)
                .FirstOrDefaultAsync();

            return r == null ? null : new ReadingDto
            {
                ReadingId = r.ReadingId,
                ConsumerId = r.ConsumerId,
                MonthYear = r.MonthYear,
                ReadingDate = r.ReadingDate,
                PresentReading = r.PresentReading,
                PreviousReading = r.PreviousReading
            };
        }

        public async Task<PaginatedResponse<ReadingDto>> GetByMonthYearAsync(DateTime monthYear, int page = 1, int pageSize = 20)
        {
            var query = _context.Readings
                .Where(r => r.MonthYear.Year == monthYear.Year &&
                            r.MonthYear.Month == monthYear.Month &&
                            r.MonthYear.Day == 1);

            var totalCount = await query.CountAsync();
            var paged = await query
                .OrderBy(r => r.ReadingId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResponse<ReadingDto>
            {
                Data = paged.Select(r => new ReadingDto
                {
                    ReadingId = r.ReadingId,
                    ConsumerId = r.ConsumerId,
                    MonthYear = r.MonthYear,
                    ReadingDate = r.ReadingDate,
                    PresentReading = r.PresentReading,
                    PreviousReading = r.PreviousReading
                }),
                CurrentPage = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<PaginatedResponse<ReadingDto>> FilterAsync(ReadingFilterDto filter)
        {
            var query = _context.Readings
                .Include(r => r.Consumer)
                .AsQueryable();

            // Filter by Purok
            if (filter.Puroks != null && filter.Puroks.Any())
                query = query.Where(r => filter.Puroks.Contains(r.Consumer.Purok));

            // Filter by MonthYear
            if (filter.MonthYear != default)
            {
                query = query.Where(r =>
                    r.MonthYear.Year == filter.MonthYear.Year &&
                    r.MonthYear.Month == filter.MonthYear.Month &&
                    r.MonthYear.Day == 1);
            }


            // Sorting
            bool desc = filter.SortDir.ToLower() == "desc";
            query = filter.SortBy?.ToLower() switch
            {
                "lastname" => desc ? query.OrderByDescending(r => r.Consumer.LastName) : query.OrderBy(r => r.Consumer.LastName),
                "presentreading" => desc ? query.OrderByDescending(r => r.PresentReading) : query.OrderBy(r => r.PresentReading),
                "previousreading" => desc ? query.OrderByDescending(r => r.PreviousReading) : query.OrderBy(r => r.PreviousReading),
                "cubicused" => desc ? query.OrderByDescending(r => r.PresentReading - r.PreviousReading) : query.OrderBy(r => r.PresentReading - r.PreviousReading),
                _ => query.OrderBy(r => r.ReadingId)
            };

            // Pagination
            var totalCount = await query.CountAsync();
            var paged = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PaginatedResponse<ReadingDto>
            {
                Data = paged.Select(r => new ReadingDto
                {
                    ReadingId = r.ReadingId,
                    ConsumerId = r.ConsumerId,
                    MonthYear = r.MonthYear,
                    ReadingDate = r.ReadingDate,
                    PresentReading = r.PresentReading,
                    PreviousReading = r.PreviousReading
                }),
                CurrentPage = filter.Page,
                PageSize = filter.PageSize,
                TotalCount = totalCount
            };
        }


        public async Task<ReadingDto> CreateAsync(ReadingCreateDto dto)
        {
            // Get latest reading for this consumer
            var lastReading = await _context.Readings
                .Where(r => r.ConsumerId == dto.ConsumerId)
                .OrderByDescending(r => r.MonthYear)
                .FirstOrDefaultAsync();

            var previous = lastReading?.PresentReading ?? 0;

            var reading = new Reading
            {
                ConsumerId = dto.ConsumerId,
                MonthYear = new DateTime(dto.MonthYear.Year, dto.MonthYear.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                ReadingDate = DateTime.UtcNow, 
                PresentReading = dto.PresentReading,
                PreviousReading = previous
            };

            _context.Readings.Add(reading);
            await _context.SaveChangesAsync();

            return new ReadingDto
            {
                ReadingId = reading.ReadingId,
                ConsumerId = reading.ConsumerId,
                MonthYear = reading.MonthYear,
                ReadingDate = reading.ReadingDate,
                PresentReading = reading.PresentReading,
                PreviousReading = reading.PreviousReading
            };
        }


        public async Task<bool> UpdateAsync(int id, ReadingUpdateDto dto)
        {
            var reading = await _context.Readings
                .FirstOrDefaultAsync(r => r.ReadingId == id);

            if (reading == null) return false;

            reading.PresentReading = dto.PresentReading;

            _context.Readings.Update(reading);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var reading = await _context.Readings
                .Include(r => r.Bills)  // Include associated bills
                .FirstOrDefaultAsync(r => r.ReadingId == id);

            if (reading == null) return false;

            // Check if the reading has associated bills
            if (reading.Bills != null && reading.Bills.Any())
            {
                // Return false if there are associated bills
                return false;
            }

            // No associated bills, so we can hard delete the reading
            _context.Readings.Remove(reading);

            // Save changes to the database
            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<ReadingSummaryDto> GetReadingSummaryAsync(DateTime monthYear)
        {
            // Fetch readings for the given monthYear where the day is 1 (base readings only)
            var readings = await _context.Readings
                .Where(r =>
                    r.MonthYear.Year == monthYear.Year &&
                    r.MonthYear.Month == monthYear.Month &&
                    r.MonthYear.Day == 1 // base readings only
                )
                .ToListAsync();

            // Calculate the sum of present and previous readings
            var sumOfPresentReading = readings.Sum(r => r.PresentReading);
            var sumOfPreviousReading = readings.Sum(r => r.PreviousReading);

            // Assuming you have a way to get the number of active consumers
            // If there's an Active flag or status in the Consumers table, you can query it here.
            var numOfActiveConsumers = await _context.Consumers
                .Where(c => c.Status.ToString() == "Active")  // Example condition for active consumers
                .CountAsync();

            // Check if a bill has been generated for the monthYear or if there are readings with an associated bill
            var billGenerated = await _context.Bills
                .AnyAsync(b =>
                    b.MonthYear.Year == monthYear.Year &&
                    b.MonthYear.Month == monthYear.Month);  // Check if a bill exists for the given monthYear


            // Return the DTO with the calculated values
            var summary = new ReadingSummaryDto
            {
                billGenerated = billGenerated,  // Set the flag based on the presence of a bill
                numOfActiveConsumers = numOfActiveConsumers,
                numOfReadings = readings.Count, // Count of readings for the given monthYear
                SumOfPresentReading = sumOfPresentReading,
                SumOfPreviousReading = sumOfPreviousReading
            };

            return summary;
        }




    }
}
