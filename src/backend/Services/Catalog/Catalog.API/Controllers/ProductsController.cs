using System.Threading.Tasks;
using Catalog.API.Contracts.Product;
using Catalog.Application.Products.Commands.CreateProduct;
using Catalog.Application.Products.Commands.DeleteProduct;
using Catalog.Application.Products.Commands.UpdateProduct;
using Catalog.Application.Products.Queries.GetProductById;
using Catalog.Application.Products.Queries.GetProducts;
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
    [Authorize(Policy = "RequireRestaurantManager")]
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var query = new GetProductByIdQuery(id, restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var restaurantId = _currentUserProvider.RestaurantId;

        if (restaurantId == null)
        {
            return Unauthorized("Brak przypisanej restauracji w tokenie JWT.");
        }

        // Założyłem standardową nazwę zapytania w MediatR: GetProductsQuery
        var query = new Catalog.Application.Products.Queries.GetProducts.GetProductsQuery(restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new UpdateProductCommand(
            id,
            request.Name,
            request.Description,
            request.Price,
            request.CategoryId,
            restaurantId.Value,
            request.Ingredients);

        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireRestaurantManager")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new DeleteProductCommand(id, restaurantId.Value);
        await _mediator.Send(command);

        return NoContent();
    }
}