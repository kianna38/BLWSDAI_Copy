using BLWSDAI.Models.DTOs;
using BLWSDAI.Services;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MimeKit;

namespace BLWSDAI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service; 
        private readonly JwtService _jwtService;

        public UsersController(IUserService service, JwtService jwtService)
        {
            _service = service;
            _jwtService = jwtService;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<UserReadDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return Ok(await _service.GetAllAsync(page, pageSize));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("filter")]
        public async Task<ActionResult<PaginatedResponse<UserReadDto>>> Filter([FromBody] UserFilterDto filter)
        {
            return Ok(await _service.FilterAsync(filter));
        }


        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserReadDto>> GetById(int id)
        {
            var user = await _service.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<UserReadDto>> Create(UserCreateDto dto)
        {
            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.UserId }, created);
            }
            catch (Exception ex)
            {
                return Conflict(new { message = ex.Message
            });
        }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserCreateDto dto)
        {
            try
            {
                var result = await _service.UpdateAsync(id, dto);
                return result ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var user = await _service.LoginAsync(dto);
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            // Generate JWT
            var token = _jwtService.GenerateToken(user.UserId, user.Email, user.Role);

            // Return token + user
            return Ok(new
            {
                token,
                user
            });
        }



        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            //localStorage.removeItem("token"); // or wherever you store the JWT
            //axios.post("/api/users/logout", { }, {
            //headers: { Authorization: `Bearer ${ token}` }
            //});
            //window.location.href = "/login"; // redirect
            return Ok(new { message = "Logged out successfully." });
        }


        [Authorize]
        [HttpPost("{id}/logs")]
        public async Task<ActionResult<PaginatedResponse<UserLogDto>>> GetUserLogs(int id, [FromBody] UserLogFilterDto filter)
        {
            filter.UserId = id; // Ensure the userId from route is used
            var logs = await _service.GetUserLogsAsync(filter);
            return Ok(logs);
        }



        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromQuery] string email)
        {
            var success = await _service.ResetPasswordToRoleNameEmailFormatAsync(email);
            if (!success)
                return NotFound(new { message = "User not found or unable to reset password." });

            return Ok(new { message = "Password reset successfully." });
        }


    }
}
