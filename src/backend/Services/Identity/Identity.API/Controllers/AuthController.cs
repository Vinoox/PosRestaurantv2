using System.Threading.Tasks;
using MediatR;
using Identity.Application.Auth.Commands.Authenticate;
using Identity.Application.Auth.Commands.RegisterUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Identity.API.Controllers
{
    public class RegisterRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }

        public string Role { get; set; } = "Default";
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        [SwaggerOperation(Summary = "Rejestracja nowego użytkownika z możliwością wyboru ról (Admin, Premium, Default)")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var command = new RegisterUserCommand
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Password = request.Password,
                ConfirmPassword = request.ConfirmPassword,
                Role = request.Role
            };

            await _mediator.Send(command);
            return Ok();
        }

        [HttpPost("login")]
        [AllowAnonymous]
        [SwaggerOperation(Summary = "Logowanie użytkownika i pobranie tokenu JWT")]
        public async Task<IActionResult> Login([FromBody] AuthenticateCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}