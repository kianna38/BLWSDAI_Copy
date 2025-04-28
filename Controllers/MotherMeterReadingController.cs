using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MotherMeterReadingsController : ControllerBase
    {
        private readonly IMotherMeterReadingService _service;
        public MotherMeterReadingsController(IMotherMeterReadingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MotherMeterReadingReadDto>>> GetAll()
            => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<MotherMeterReadingReadDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }


        [HttpGet("month-year")]
        public async Task<ActionResult<MotherMeterReadingReadDto>> GetByMonthYear([FromQuery] DateTime monthYear)
        {
            var result = await _service.GetByMonthYearAsync(monthYear);
            return result == null ? NotFound() : Ok(result);
        }



        [HttpPost]
        public async Task<ActionResult<MotherMeterReadingReadDto>> CreateOrUpdate(MotherMeterReadingCreateDto dto)
        {
            var created = await _service.CreateOrUpdateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.MotherMeterReadingId }, created);
        }



        [HttpGet("system-loss")]
        public async Task<ActionResult<decimal?>> GetSystemLoss([FromQuery] DateTime monthYear)
        {
            var loss = await _service.GetBaseSystemLossAsync(monthYear);
            return loss == null ? NotFound("No data found to compute system loss.") : Ok(loss);
        }
    }
}
