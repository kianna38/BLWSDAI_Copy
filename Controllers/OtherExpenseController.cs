using Microsoft.AspNetCore.Mvc;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace BLWSDAI.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class OtherExpensesController : ControllerBase
    {
        private readonly IOtherExpenseService _service;

        public OtherExpensesController(IOtherExpenseService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<OtherExpenseReadDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OtherExpenseReadDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<OtherExpenseReadDto>> Create([FromBody] OtherExpenseCreateUpdateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.ExpenseId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OtherExpenseCreateUpdateDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            return success ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }

        [HttpPost("filter")]
        public async Task<ActionResult<PaginatedResponse<OtherExpenseReadDto>>> Filter([FromBody] OtherExpenseFilterRequestDto request)
        {
            var result = await _service.FilterAsync(request);
            return Ok(result);
        }

    }

}
