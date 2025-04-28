using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using System.Threading.Tasks;

namespace BLWSDAI.Services.Interfaces
{
    public interface IBillService
    {
        Task<List<Bill>> CreateBillsAsync(DateTime monthYear); 
        
        Task<BillReadDto?> GetBillByIdAsync(int billId);
        Task<PaginatedResponse<BillReadDto>> FilterBillsAsync(BillFilterRequestDto filter);
        Task<bool> DeleteBillAsync(DateTime monthYear);

        Task<PaginatedResponse<BillReadDto>> GetBillsByMonthYearAsync(DateTime monthYear, int page = 1, int pageSize = 20);

    }
}
