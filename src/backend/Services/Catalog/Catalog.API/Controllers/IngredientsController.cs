using System.Threading.Tasks;
using Catalog.API.Contracts.Ingredient;
using Catalog.Application.Ingredients.Commands.CreateIngredient;
using Catalog.Application.Ingredients.Commands.DeleteIngredient;
using Catalog.Application.Ingredients.Commands.UpdateIngredient;
using Catalog.Application.Ingredients.Queries.GetIngredientById;
using Catalog.Application.Ingredients.Queries.GetIngredients;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IngredientsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserProvider _currentUserProvider;

    public IngredientsController(IMediator mediator, ICurrentUserProvider currentUserProvider)
    {
        _mediator = mediator;
        _currentUserProvider = currentUserProvider;
    }

    [HttpGet]
    public async Task<IActionResult> GetIngredients()
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var query = new Catalog.Application.Ingredients.Queries.GetIngredients.GetIngredientsQuery(restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> CreateIngredient([FromBody] CreateIngredientRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;

        if (restaurantId == null)
        {
            return Unauthorized("Brak przypisanej restauracji w tokenie JWT.");
        }

        var command = new CreateIngredientCommand(request.Name, request.Unit, request.InitialStock, restaurantId.Value);

        var result = await _mediator.Send(command);
        return Created(string.Empty, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetIngredientById(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var query = new GetIngredientByIdQuery(id, restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> UpdateIngredient(Guid id, [FromBody] UpdateIngredientRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new UpdateIngredientCommand(id, request.Name, request.Unit, restaurantId.Value);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> DeleteIngredient(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new DeleteIngredientCommand(id, restaurantId.Value);
        await _mediator.Send(command);

        return NoContent();
    }
}