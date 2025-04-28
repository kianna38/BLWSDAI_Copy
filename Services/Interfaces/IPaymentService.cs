using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;

namespace BLWSDAI.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentReadDto?> CreatePaymentAsync(PaymentCreateDto dto);

        Task<PaginatedResponse<PaymentReadDto>> GetAllAsync(int page, int pageSize);
        Task<PaginatedResponse<PaymentReadDto>> FilterAsync(PaymentFilterRequestDto filter);

        Task<PaymentReadDto?> GetPaymentByIdAsync(int billId);
        Task<bool> DeleteAsync(int paymentId);


    }
}
