using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using System.Threading.Tasks;

namespace BLWSDAI.Services.Interfaces
{
    public interface IOtherExpenseService
    {
        Task<List<OtherExpenseReadDto>> GetAllAsync();
        Task<OtherExpenseReadDto?> GetByIdAsync(int id);
        Task<OtherExpenseReadDto> CreateAsync(OtherExpenseCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, OtherExpenseCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<PaginatedResponse<OtherExpenseReadDto>> FilterAsync(OtherExpenseFilterRequestDto request);

    }

}
