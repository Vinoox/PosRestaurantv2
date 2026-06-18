using System.Threading.Tasks;
using Catalog.API.Contracts;
using Catalog.Application.Categories.Commands.CreateCategory;
using Catalog.Application.Categories.Commands.DeleteCategory;
using Catalog.Application.Categories.Commands.UpdateCategory;
using Catalog.Application.Categories.Queries.GetCategories;
using Catalog.Application.Categories.Queries.GetCategoryById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserProvider _currentUserProvider;

    public CategoriesController(IMediator mediator, ICurrentUserProvider currentUserProvider)
    {
        _mediator = mediator;
        _currentUserProvider = currentUserProvider;
    }

    [HttpPost]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;

        if (restaurantId == null)
        {
            return Unauthorized("Brak przypisanej restauracji w tokenie JWT.");
        }

        var command = new CreateCategoryCommand(request.Name, request.Description, restaurantId.Value);

        var result = await _mediator.Send(command);
        return Created(string.Empty, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var restaurantId = _currentUserProvider.RestaurantId;

        if (restaurantId == null)
        {
            return Unauthorized("Brak przypisanej restauracji w tokenie JWT.");
        }

        var query = new GetCategoriesQuery(restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCategoryById(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var query = new GetCategoryByIdQuery(id, restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new UpdateCategoryCommand(id, request.Name, request.Description, restaurantId.Value);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new DeleteCategoryCommand(id, restaurantId.Value);
        await _mediator.Send(command);

        return NoContent();
    }
}