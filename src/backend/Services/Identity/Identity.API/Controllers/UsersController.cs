using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Identity.Application.Users.Queries.GetUser;
using Identity.Application.Users.Commands.ChangePassword;
using Identity.Application.Users.Commands.UpdateUserProfile;

namespace Identity.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("me")]
        [SwaggerOperation(Summary = "Pobranie danych aktualnie zalogowanego użytkownika")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var query = new GetUserQuery { UserId = Guid.Parse(userId!) };
            var user = await _mediator.Send(query);

            return Ok(user);
        }

        [HttpPut("me/profile")]
        [SwaggerOperation(Summary = "Aktualizacja profilu użytkownika")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            command.UserId = Guid.Parse(userId!);

            await _mediator.Send(command);

            return NoContent();
        }

        [HttpPut("me/password")]
        [SwaggerOperation(Summary = "Zmiana hasła użytkownika")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            command.UserId = Guid.Parse(userId!);

            await _mediator.Send(command);

            return NoContent();
        }
    }
}