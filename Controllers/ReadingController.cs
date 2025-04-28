using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReadingsController : ControllerBase
    {
        private readonly IReadingService _service;
        public ReadingsController(IReadingService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReadingDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReadingDto>> GetById(int id)
        {
            var reading = await _service.GetByIdAsync(id);
            return reading == null ? NotFound() : Ok(reading);
        }

        [HttpPost("filter")]
        public async Task<ActionResult<PaginatedResponse<ReadingDto>>> Filter([FromBody] ReadingFilterDto filter)
        {
            return Ok(await _service.FilterAsync(filter));
        }

        [HttpGet("monthYear")]
        public async Task<ActionResult<PaginatedResponse<ReadingDto>>> GetByMonthYear([FromQuery] DateTime monthYear, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return Ok(await _service.GetByMonthYearAsync(monthYear, page, pageSize));
        }


        [HttpPost]
        public async Task<ActionResult<ReadingDto>> Create([FromBody] ReadingCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.ReadingId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReadingUpdateDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        [HttpGet("month-year/summary")]
        public async Task<ActionResult<ReadingSummaryDto>> GetReadingSummary([FromQuery] DateTime monthYear)
        {
            var result = await _service.GetReadingSummaryAsync(monthYear);
            return Ok(result);
        }

    }
}
