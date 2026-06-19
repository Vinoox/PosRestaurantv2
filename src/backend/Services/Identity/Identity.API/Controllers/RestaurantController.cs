using System;
using System.Threading.Tasks;
using Identity.API.Contracts;
using Identity.Application.Restaurants.Commands.AddEmployee;
using Identity.Application.Restaurants.Commands.ChangeEmployeeRole;
using Identity.Application.Restaurants.Commands.CreateRestaurantRole;
using Identity.Application.Restaurants.Commands.DeactivateRestaurant;
using Identity.Application.Restaurants.Commands.DeleteRestaurantRole;
using Identity.Application.Restaurants.Commands.RegisterRestaurant;
using Identity.Application.Restaurants.Commands.RemoveEmployee;
using Identity.Application.Restaurants.Commands.RenameRestaurantRole;
using Identity.Application.Restaurants.Commands.UpdateRestaurantDetails;
using Identity.Application.Restaurants.Queries.GetEmployees;
using Identity.Application.Restaurants.Queries.GetRestaurantDetails;
using Identity.Application.Restaurants.Queries.GetRestaurantRoles;
using Identity.Application.Restaurants.Queries.GetUserRestaurants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosRestaurant.Shared.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RestaurantsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserProvider _currentUserProvider;

    public RestaurantsController(IMediator mediator, ICurrentUserProvider currentUserProvider)
    {
        _mediator = mediator;
        _currentUserProvider = currentUserProvider;
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Rejestracja nowej restauracji w systemie")]
    public async Task<IActionResult> RegisterRestaurant([FromBody] RegisterRestaurantRequest request)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new RegisterRestaurantCommand(request.Name, request.Address, request.TaxId, userId.Value);
        var restaurantId = await _mediator.Send(command);

        return Created($"/api/restaurants/{restaurantId}", new { Id = restaurantId });
    }

    [HttpPost("{restaurantId:guid}/roles")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Tworzenie nowej roli w restauracji (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> CreateRole([FromRoute] Guid restaurantId, [FromBody] CreateRestaurantRoleRequest request)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new CreateRestaurantRoleCommand (restaurantId, request.Name,userId.Value);
        var roleId = await _mediator.Send(command);

        return Created($"/api/restaurants/{restaurantId}/roles/{roleId}", new { Id = roleId });
    }

    [HttpPost("{restaurantId:guid}/employees")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Dodawanie pracownika do restauracji (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> AddEmployee([FromRoute] Guid restaurantId, [FromBody] AddEmployeeRequest request)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new AddEmployeeCommand(restaurantId, request.EmployeeEmail, request.RoleId, userId.Value);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpGet("{restaurantId:guid}/employees")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Pobieranie listy pracowników restauracji (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> GetEmployees([FromRoute] Guid restaurantId)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var query = new GetEmployeesQuery(restaurantId, userId.Value);
        var employees = await _mediator.Send(query);

        return Ok(employees);
    }

    [HttpPut("{restaurantId:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Aktualizacja danych restauracji (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> UpdateRestaurant([FromRoute] Guid restaurantId, [FromBody] UpdateRestaurantDetailsRequest request)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new UpdateRestaurantDetailsCommand (restaurantId, request.Name, request.Address, request.TaxId, userId.Value );
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{restaurantId:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Dezaktywacja restauracji (Soft-Delete) (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> DeactivateRestaurant([FromRoute] Guid restaurantId)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new DeactivateRestaurantCommand (restaurantId, userId.Value );
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Pobieranie listy restauracji przypisanych do zalogowanego użytkownika")]
    public async Task<IActionResult> GetUserRestaurants()
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var query = new GetUserRestaurantsQuery(userId.Value);
        var restaurants = await _mediator.Send(query);

        return Ok(restaurants);
    }

    [HttpGet("{restaurantId:guid}")]
    [SwaggerOperation(Summary = "Pobieranie szczegółów restauracji")]
    public async Task<IActionResult> GetRestaurantDetails([FromRoute] Guid restaurantId)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var query = new GetRestaurantDetailsQuery(restaurantId, userId.Value);
        var details = await _mediator.Send(query);

        return Ok(details);
    }

    [HttpGet("{restaurantId:guid}/roles")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Pobieranie listy ról w restauracji (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> GetRoles([FromRoute] Guid restaurantId)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var query = new GetRestaurantRolesQuery(restaurantId, userId.Value);
        var roles = await _mediator.Send(query);

        return Ok(roles);
    }

    [HttpPut("{restaurantId:guid}/roles/{roleId:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Zmiana nazwy roli (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> RenameRole([FromRoute] Guid restaurantId, [FromRoute] Guid roleId, [FromBody] RenameRestaurantRoleRequest request)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new RenameRestaurantRoleCommand (restaurantId, roleId, request.NewName, userId.Value);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{restaurantId:guid}/roles/{roleId:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Usuwanie roli (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> DeleteRole([FromRoute] Guid restaurantId, [FromRoute] Guid roleId)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new DeleteRestaurantRoleCommand(restaurantId, roleId, userId.Value);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpPut("{restaurantId:guid}/employees/{employeeId:guid}/role")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Zmiana roli pracownika (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> ChangeEmployeeRole([FromRoute] Guid restaurantId, [FromRoute] Guid employeeId, [FromBody] ChangeEmployeeRoleRequest request)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new ChangeEmployeeRoleCommand ( restaurantId, employeeId, request.NewRoleId, userId.Value );
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{restaurantId:guid}/employees/{employeeId:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    [SwaggerOperation(Summary = "Zwolnienie pracownika z restauracji (Wymaga uprawnień Managera)")]
    public async Task<IActionResult> RemoveEmployee([FromRoute] Guid restaurantId, [FromRoute] Guid employeeId)
    {
        var userId = _currentUserProvider.UserId;
        if (userId == null) return Unauthorized();

        var command = new RemoveEmployeeCommand(restaurantId, employeeId, userId.Value);
        await _mediator.Send(command);

        return NoContent();
    }
}