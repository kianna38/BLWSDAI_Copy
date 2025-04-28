using BLWSDAI.Models.DTOs;

namespace BLWSDAI.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardOverviewDto> GetDashboardDataAsync(int currentYear, int comparisonYear);

    }
}
