using BLWSDAI.Data;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Models;
using BLWSDAI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class SalaryInfoService : ISalaryInfoService
{
    private readonly ApplicationDbContext _context;

    public SalaryInfoService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SalaryInfoDto> GetLatestSalaryAsync()
    {
        var latest = await _context.SalaryInfos
            .OrderByDescending(s => s.UpdatedAt)
            .FirstOrDefaultAsync();

        if (latest == null) throw new Exception("No salary info available.");

        return MapToDto(latest);
    }

    public async Task<List<SalaryInfoDto>> GetAllSalaryHistoryAsync()
    {
        return await _context.SalaryInfos
            .OrderByDescending(s => s.UpdatedAt)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<SalaryInfoDto> CreateNewSalaryAsync(UpdateSalaryInfoDto dto)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        // Remove existing entry in the same month
        var existing = await _context.SalaryInfos
            .Where(s => s.UpdatedAt.Year == now.Year && s.UpdatedAt.Month == now.Month)
            .ToListAsync();

        if (existing.Any())
        {
            _context.SalaryInfos.RemoveRange(existing);
            await _context.SaveChangesAsync();
        }

        var salary = new SalaryInfo
        {
            PresidentSalary = dto.PresidentSalary,
            VicePresidentSalary = dto.VicePresidentSalary,
            SecretarySalary = dto.SecretarySalary,
            TreasurerSalary = dto.TreasurerSalary,
            AuditorSalary = dto.AuditorSalary,
            MaintenanceOneSalary = dto.MaintenanceOneSalary,
            MaintenanceTwoSalary = dto.MaintenanceTwoSalary,
            UpdatedAt = now
        };

        _context.SalaryInfos.Add(salary);
        await _context.SaveChangesAsync();

        return MapToDto(salary);
    }


    private SalaryInfoDto MapToDto(SalaryInfo s)
    {
        return new SalaryInfoDto
        {
            PresidentSalary = s.PresidentSalary,
            VicePresidentSalary = s.VicePresidentSalary,
            SecretarySalary = s.SecretarySalary,
            TreasurerSalary = s.TreasurerSalary,
            AuditorSalary = s.AuditorSalary,
            MaintenanceOneSalary = s.MaintenanceOneSalary,
            MaintenanceTwoSalary = s.MaintenanceTwoSalary,
            UpdatedAt = s.UpdatedAt
        };
    }
}
