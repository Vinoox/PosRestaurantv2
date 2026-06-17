using System.Threading.Tasks;
using MediatR;
using Identity.Application.Auth.Commands.Authenticate;
using Identity.Application.Auth.Commands.RegisterUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Identity.API.Controllers
{
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
        [SwaggerOperation(Summary = "Rejestracja nowego użytkownika")]
        public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
        {
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