using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Identity.Application.Restaurants.Commands.AddEmployee;
using Identity.Application.Restaurants.Commands.CreateRestaurantRole;
using Identity.Application.Restaurants.Commands.DeactivateRestaurant;
using Identity.Application.Restaurants.Commands.DeleteRestaurantRole;
using Identity.Application.Restaurants.Commands.RegisterRestaurant;
using Identity.Application.Restaurants.Commands.RenameRestaurantRole;
using Identity.Application.Restaurants.Commands.UpdateRestaurantDetails;
using Identity.Application.Restaurants.Queries.GetEmployees;
using Identity.Application.Restaurants.Queries.GetRestaurantDetails;
using Identity.Application.Restaurants.Queries.GetRestaurantRoles;
using Identity.Application.Restaurants.Queries.GetUserRestaurants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Identity.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RestaurantsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RestaurantsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Rejestracja nowej restauracji w systemie",
                          Description = "Właściciel (OwnerId) jest przypisywany automatycznie na podstawie zalogowanego użytkownika.")]
        public async Task<IActionResult> RegisterRestaurant([FromBody] RegisterRestaurantRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { Message = "Nieprawidłowy token użytkownika." });
            }

            var command = new RegisterRestaurantCommand(
                request.Name,
                request.Address,
                request.TaxId,
                userId
            );

            var restaurantId = await _mediator.Send(command);

            return Created($"/api/restaurants/{restaurantId}", new { Id = restaurantId });
        }

        [HttpPost("{restaurantId:guid}/roles")]
        [SwaggerOperation(Summary = "Tworzenie nowej roli w restauracji (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> CreateRole([FromRoute] Guid restaurantId, [FromBody] CreateRestaurantRoleCommand command)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            command.RestaurantId = restaurantId;
            command.RequesterId = Guid.Parse(userId!);

            var roleId = await _mediator.Send(command);

            return Created($"/api/restaurants/{restaurantId}/roles/{roleId}", new { Id = roleId });
        }

        [HttpPost("{restaurantId:guid}/employees")]
        [SwaggerOperation(Summary = "Dodawanie pracownika do restauracji (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> AddEmployee([FromRoute] Guid restaurantId, [FromBody] AddEmployeeCommand command)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            command.RestaurantId = restaurantId;
            command.RequesterId = Guid.Parse(userId!);

            await _mediator.Send(command);

            return NoContent();
        }

        [HttpGet("{restaurantId:guid}/employees")]
        [SwaggerOperation(Summary = "Pobieranie listy pracowników restauracji (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> GetEmployees([FromRoute] Guid restaurantId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var query = new GetEmployeesQuery(restaurantId, Guid.Parse(userId!));
            var employees = await _mediator.Send(query);

            return Ok(employees);
        }

        [HttpPut("{restaurantId:guid}")]
        [SwaggerOperation(Summary = "Aktualizacja danych restauracji (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> UpdateRestaurant([FromRoute] Guid restaurantId, [FromBody] UpdateRestaurantDetailsCommand command)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            command.RestaurantId = restaurantId;
            command.RequesterId = Guid.Parse(userId!);

            await _mediator.Send(command);

            return NoContent();
        }

        [HttpDelete("{restaurantId:guid}")]
        [SwaggerOperation(Summary = "Dezaktywacja restauracji (Soft-Delete) (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> DeactivateRestaurant([FromRoute] Guid restaurantId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var command = new DeactivateRestaurantCommand
            {
                RestaurantId = restaurantId,
                RequesterId = Guid.Parse(userId!)
            };

            await _mediator.Send(command);

            return NoContent();
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Pobieranie listy restauracji przypisanych do zalogowanego użytkownika")]
        public async Task<IActionResult> GetUserRestaurants()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var query = new GetUserRestaurantsQuery(Guid.Parse(userId!));

            var restaurants = await _mediator.Send(query);

            return Ok(restaurants);
        }

        [HttpGet("{restaurantId:guid}")]
        [SwaggerOperation(Summary = "Pobieranie szczegółów restauracji")]
        public async Task<IActionResult> GetRestaurantDetails([FromRoute] Guid restaurantId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var query = new GetRestaurantDetailsQuery(restaurantId, Guid.Parse(userId!));

            var details = await _mediator.Send(query);

            return Ok(details);
        }

        [HttpGet("{restaurantId:guid}/roles")]
        [SwaggerOperation(Summary = "Pobieranie listy ról w restauracji (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> GetRoles([FromRoute] Guid restaurantId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var query = new GetRestaurantRolesQuery(restaurantId, Guid.Parse(userId!));

            var roles = await _mediator.Send(query);
            return Ok(roles);
        }

        [HttpPut("{restaurantId:guid}/roles/{roleId:guid}")]
        [SwaggerOperation(Summary = "Zmiana nazwy roli (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> RenameRole(
            [FromRoute] Guid restaurantId,
            [FromRoute] Guid roleId,
            [FromBody] RenameRestaurantRoleCommand command)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            command.RestaurantId = restaurantId;
            command.RoleId = roleId;
            command.RequesterId = Guid.Parse(userId!);

            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{restaurantId:guid}/roles/{roleId:guid}")]
        [SwaggerOperation(Summary = "Usuwanie roli (Wymaga uprawnień Managera)")]
        public async Task<IActionResult> DeleteRole([FromRoute] Guid restaurantId, [FromRoute] Guid roleId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var command = new DeleteRestaurantRoleCommand(restaurantId, roleId, Guid.Parse(userId!));

            await _mediator.Send(command);
            return NoContent();
        }

    }

    public class RegisterRestaurantRequest
    {
        public required string Name { get; set; }
        public string? Address { get; set; }
        public string? TaxId { get; set; }
    }
}