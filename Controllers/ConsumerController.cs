using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConsumersController : ControllerBase
    {
        private readonly IConsumerService _service;

        public ConsumersController(IConsumerService service)
        {
            _service = service;
        }


        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<ConsumerReadDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return Ok(await _service.GetAllAsync(page, pageSize));
        }


        [HttpPost("filter")]
        public async Task<ActionResult<PaginatedResponse<ConsumerReadDto>>> Filter([FromBody] ConsumerFilterDto filter)
        {
            return Ok(await _service.FilterAsync(filter));
        }





        [HttpGet("{id}")]
        public async Task<IActionResult> GetConsumerById(int id)
        {
            var consumer = await _service.GetByIdAsync(id);

            if (consumer == null)
            {
                return NotFound(); // Return 404 if no consumer is found
            }

            return Ok(consumer); // Return the consumer along with bills as a response
        }


        [HttpPost]
        public async Task<IActionResult> CreateConsumer([FromBody] ConsumerCreateUpdateDto dto)
        {
            try
            {
                var createdConsumer = await _service.CreateAsync(dto);  // Call CreateAsync to get the ConsumerReadDto
                return Ok(createdConsumer); // Return the created consumer as the response
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Handle any errors and return a bad request
            }
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ConsumerCreateUpdateDto dto)
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

        [HttpPost("filter-bills")]
        public async Task<ActionResult<PaginatedResponse<ConsumerBillPaymentDto>>> FilterConsumerBill([FromBody] ConsumerBillPaymentFilterDto filter)
        {
            try
            {
                var result = await _service.GetConsumerBillPaymentDataAsync(filter);
                return Ok(result); // Return the paginated result
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}
