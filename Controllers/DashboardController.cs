using Microsoft.AspNetCore.Mvc;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace BLWSDAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("overview")]
        public async Task<ActionResult<DashboardOverviewDto>> GetDashboardOverview(
            [FromQuery] int currentYear = 0,
            [FromQuery] int comparisonYear = 0)
        {
            currentYear = currentYear == 0 ? DateTime.UtcNow.Year : currentYear;
            comparisonYear = comparisonYear == 0 ? currentYear - 1 : comparisonYear;

            var result = await _dashboardService.GetDashboardDataAsync(currentYear, comparisonYear);
            return Ok(result);
        }

    }

}
