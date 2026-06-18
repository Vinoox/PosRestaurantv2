using System.Threading.Tasks;
using Catalog.API.Contracts;
using Catalog.Application.Ingredients.Commands.CreateIngredient;
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
}