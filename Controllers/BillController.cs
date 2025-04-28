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
    public class BillsController : ControllerBase
    {
        private readonly IBillService _billService;

        public BillsController(IBillService billService)
        {
            _billService = billService;
        }


        [HttpPost("generate")]
        public async Task<ActionResult<IEnumerable<BillReadDto>>> GenerateBills([FromQuery] DateTime monthYear)
        {
            try
            {
                var bills = await _billService.CreateBillsAsync(monthYear);

                var result = bills.Select(b => new BillReadDto
                {
                    BillId = b.BillId,
                    ConsumerId = b.ConsumerId,
                    ReadingId = b.ReadingId,
                    MotherMeterReadingId = b.MotherMeterReadingId,
                    MonthYear = b.MonthYear,
                    BillingDate = b.BillingDate,
                    SystemLoss = b.SystemLoss,
                    Subsidy = b.Subsidy,
                    Balance = b.Balance,
                    TotalAmount = b.TotalAmount,
                    Status = b.Status.ToString(),
                    NotifStatus = b.NotifStatus
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<BillReadDto>> GetById(int id)
        {
            var bill = await _billService.GetBillByIdAsync(id);
            return bill == null ? NotFound() : Ok(bill);
        }

        [HttpPost("filter")]
        public async Task<ActionResult<PaginatedResponse<BillReadDto>>> FilterBills([FromBody] BillFilterRequestDto request)
        {
            var result = await _billService.FilterBillsAsync(request);
            return Ok(result);
        }

        [HttpDelete("monthYear")]
        public async Task<IActionResult> DeleteBillByMonthYear([FromQuery] DateTime monthYear)
        {
            var result = await _billService.DeleteBillAsync(monthYear);

            if (!result)
                return BadRequest("Cannot delete bills because there are associated payments.");

            return NoContent(); // or Ok() if you prefer returning a 200
        }

        [HttpGet("monthYear")]
        public async Task<ActionResult<PaginatedResponse<BillReadDto>>> GetByMonthYear([FromQuery] DateTime monthYear, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return Ok(await _billService.GetBillsByMonthYearAsync(monthYear, page, pageSize));
        }




    }
}
