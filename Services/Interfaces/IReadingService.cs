using BLWSDAI.Models.DTOs;

namespace BLWSDAI.Services.Interfaces
{
    public interface IReadingService
    {
        Task<IEnumerable<ReadingDto>> GetAllAsync();
        Task<ReadingDto?> GetByIdAsync(int id);

        Task<PaginatedResponse<ReadingDto>> GetByMonthYearAsync(DateTime monthYear, int page = 1, int pageSize = 20);
        Task<PaginatedResponse<ReadingDto>> FilterAsync(ReadingFilterDto filter);

        Task<ReadingDto> CreateAsync(ReadingCreateDto dto);
        Task<bool> UpdateAsync(int readingId, ReadingUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<ReadingSummaryDto> GetReadingSummaryAsync(DateTime monthYear);

    }
}
