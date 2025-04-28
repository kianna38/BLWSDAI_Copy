using BLWSDAI.Models.DTOs;

namespace BLWSDAI.Services.Interfaces
{
    public interface IMotherMeterReadingService
    {
        Task<IEnumerable<MotherMeterReadingReadDto>> GetAllAsync();
        Task<MotherMeterReadingReadDto?> GetByIdAsync(int id);
        Task<MotherMeterReadingReadDto?> GetByMonthYearAsync(DateTime monthYear);
        Task<MotherMeterReadingReadDto> CreateOrUpdateAsync(MotherMeterReadingCreateDto dto);
        Task<BaseSystemLossResultDto?> GetBaseSystemLossAsync(DateTime monthYear);


    }
}
