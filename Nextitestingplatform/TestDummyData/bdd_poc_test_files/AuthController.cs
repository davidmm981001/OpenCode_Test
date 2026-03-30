using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Demo.Auth.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(request.Email, request.Password);

            if (result.Status == LoginStatus.InvalidCredentials)
                return Unauthorized(new { message = "Invalid credentials" });

            if (result.Status == LoginStatus.Inactive)
                return Forbid();

            if (result.Status == LoginStatus.Locked)
                return StatusCode(423, new { message = "Account locked" });

            return Ok(result);
        }
    }
}
