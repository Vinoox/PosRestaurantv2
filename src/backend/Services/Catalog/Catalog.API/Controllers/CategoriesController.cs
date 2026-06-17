using Catalog.Application.Categories.Commands.CreateCategory;
using Catalog.Application.Categories.Queries.GetCategories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var result = await _mediator.Send(command);

        return Created(string.Empty, result);
    }

    [HttpGet("{restaurantId:guid}")]
    public async Task<IActionResult> GetCategories(Guid restaurantId)
    {
        var query = new GetCategoriesQuery(restaurantId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}