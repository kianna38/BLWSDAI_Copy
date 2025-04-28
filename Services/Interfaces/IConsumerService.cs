using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BLWSDAI.Services.Interfaces
{
    public interface IConsumerService
    {
        Task<PaginatedResponse<ConsumerReadDto>> GetAllAsync(int page = 1, int pageSize = 20);
        Task<PaginatedResponse<ConsumerReadDto>> FilterAsync(ConsumerFilterDto filter);

        Task<ConsumerReadDto?> GetByIdAsync(int id);
        Task<ConsumerReadDto> CreateAsync(ConsumerCreateUpdateDto dto);  // Returning ConsumerReadDto
        Task<bool> UpdateAsync(int id, ConsumerCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);

        Task<PaginatedResponse<ConsumerBillPaymentDto>> GetConsumerBillPaymentDataAsync(ConsumerBillPaymentFilterDto filter);

    }
}
