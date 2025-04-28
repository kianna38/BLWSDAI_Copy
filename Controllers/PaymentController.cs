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
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost]
        public async Task<ActionResult<PaymentReadDto>> CreatePayment([FromBody] PaymentCreateDto dto)
        {
            var result = await _paymentService.CreatePaymentAsync(dto);

            if (result == null)
                return BadRequest(new { message = "Invalid bill." });

            return Ok(result);
        }


        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<PaymentReadDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _paymentService.GetAllAsync(page, pageSize);
            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentReadDto>> GetPaymentById(int id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            return payment == null ? NotFound() : Ok(payment);
        }

        [HttpPost("filter")]
        public async Task<ActionResult<PaginatedResponse<PaymentReadDto>>> Filter([FromBody] PaymentFilterRequestDto filter)
        {
            var result = await _paymentService.FilterAsync(filter);
            return Ok(result);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _paymentService.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }


    }

}
