using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("income-report")]
    public async Task<ActionResult<IncomeReportDto>> GetIncomeReport([FromQuery] DateTime startMonth, [FromQuery] DateTime endMonth)
    {
        var report = await _reportService.GenerateIncomeReportAsync(startMonth, endMonth);
        return Ok(report);
    }

    [HttpGet("disconnection-report")]
    public async Task<ActionResult<List<GeneralDisconnectionItemDto>>> GetGeneralDisconnectionReport([FromQuery] DateTime month)
    {
        // Enforce UTC DateTime
        month = DateTime.SpecifyKind(month, DateTimeKind.Utc);

        var report = await _reportService.GetGeneralDisconnectionReportAsync(month);
        return Ok(report);
    }

    [HttpGet("disconnection-report/consumer/{consumerId}")]
    public async Task<ActionResult<IndividualDisconnectionReportDto>> GetIndividualDisconnectionReport(int consumerId)
    {
        var report = await _reportService.GetIndividualDisconnectionReportAsync(consumerId);
        return Ok(report);
    }


    [HttpPost("send-disconnection-notice/{consumerId}")]
    public async Task<IActionResult> SendDisconnectionNotice(int consumerId)
    {
        try
        {
            await _reportService.SendDisconnectionNoticeAsync(consumerId);
            return Ok(new { message = "Disconnection notice sent successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
