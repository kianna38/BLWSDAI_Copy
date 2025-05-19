using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;

namespace BLWSDAI.Services.Interfaces
{
    public interface IUserService
    {
        Task<PaginatedResponse<UserReadDto>> GetAllAsync(int page = 1, int pageSize = 20);
        Task<PaginatedResponse<UserReadDto>> FilterAsync(UserFilterDto filter);

        Task<UserReadDto?> GetByIdAsync(int id);
        Task<UserReadDto> CreateAsync(UserCreateDto dto);
        Task<bool> UpdateAsync(int id, UserCreateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<UserReadDto?> LoginAsync(UserLoginDto dto);
        Task<PaginatedResponse<UserLogDto>> GetUserLogsAsync(UserLogFilterDto filter);

        Task<bool> ResetPasswordToRoleNameEmailFormatAsync(string email);


    }
}
