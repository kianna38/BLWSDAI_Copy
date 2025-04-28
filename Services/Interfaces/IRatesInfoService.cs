using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;

namespace BLWSDAI.Services.Interfaces
{
    public interface IRatesInfoService
    {
        Task<RatesInfoDto> GetRatesAsync();
        Task<RatesInfoDto> UpdateRatesAsync(UpdateRatesInfoDto dto);
    }

}