using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalaryInfoController : ControllerBase
    {
        private readonly ISalaryInfoService _salaryService;

        public SalaryInfoController(ISalaryInfoService salaryService)
        {
            _salaryService = salaryService;
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("salary/update")]
        public async Task<ActionResult<SalaryInfoDto>> CreateOrUpdateSalaryInfo([FromBody] UpdateSalaryInfoDto dto)
        {
            var result = await _salaryService.CreateNewSalaryAsync(dto);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("salary/latest")]
        public async Task<ActionResult<SalaryInfoDto>> GetLatestSalary()
        {
            var result = await _salaryService.GetLatestSalaryAsync();
            return Ok(result);
        }

        [Authorize]
        [HttpGet("salary/history")]
        public async Task<ActionResult<List<SalaryInfoDto>>> GetAllSalaryHistory()
        {
            var result = await _salaryService.GetAllSalaryHistoryAsync();
            return Ok(result);
        }
    }

}
