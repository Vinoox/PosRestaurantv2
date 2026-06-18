using System.Threading.Tasks;
using Catalog.API.Contracts;
using Catalog.Application.Products.Commands.CreateProduct;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserProvider _currentUserProvider;

    public ProductsController(IMediator mediator, ICurrentUserProvider currentUserProvider)
    {
        _mediator = mediator;
        _currentUserProvider = currentUserProvider;
    }

    [HttpPost]
    [Authorize(Roles = "Manager, Admin")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;

        if (restaurantId == null)
        {
            return Unauthorized("Brak przypisanej restauracji w tokenie JWT.");
        }

        var command = new CreateProductCommand(
            request.Name,
            request.Description,
            request.Price,
            request.CategoryId,
            restaurantId.Value,
            request.Ingredients);

        var result = await _mediator.Send(command);
        return Created(string.Empty, result);
    }
}