using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;

namespace BLWSDAI.Services.Interfaces
{
    public interface ISalaryInfoService
    {
        Task<SalaryInfoDto> CreateNewSalaryAsync(UpdateSalaryInfoDto dto);
        Task<SalaryInfoDto> GetLatestSalaryAsync();
        Task<List<SalaryInfoDto>> GetAllSalaryHistoryAsync(); 

    }

}