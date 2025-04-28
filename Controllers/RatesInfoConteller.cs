using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatesInfoController : ControllerBase
    {
        private readonly IRatesInfoService _ratesService;

        public RatesInfoController(IRatesInfoService ratesService)
        {
            _ratesService = ratesService;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<RatesInfoDto>> GetRates() => await _ratesService.GetRatesAsync();

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult<RatesInfoDto>> UpdateRates(UpdateRatesInfoDto dto) => await _ratesService.UpdateRatesAsync(dto);
    }
}
