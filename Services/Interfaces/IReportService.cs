using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using System.Threading.Tasks;

namespace BLWSDAI.Services.Interfaces
{
    public interface IReportService
    {
        Task<List<GeneralDisconnectionItemDto>> GetGeneralDisconnectionReportAsync(DateTime asOfMonth);

        Task<IndividualDisconnectionReportDto> GetIndividualDisconnectionReportAsync(int consumerId);


        Task<IncomeReportDto> GenerateIncomeReportAsync(DateTime startMonth, DateTime endMonth);

        Task SendDisconnectionNoticeAsync(int consumerId);

    }
}
