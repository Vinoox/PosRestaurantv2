using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Contracts;
using Ordering.Application.Orders.Commands.AddOrderItem;
using Ordering.Application.Orders.Commands.CreateOrder;
using Ordering.Application.Orders.Commands.PayOrder;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireRestaurantAccess")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserProvider _currentUserProvider;

    public OrdersController(IMediator mediator, ICurrentUserProvider currentUserProvider)
    {
        _mediator = mediator;
        _currentUserProvider = currentUserProvider;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new CreateOrderCommand(restaurantId.Value, request.TableNumber);
        var orderId = await _mediator.Send(command);

        return Created($"/api/orders/{orderId}", new { Id = orderId });
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] AddOrderItemRequest request)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var authHeader = Request.Headers.Authorization.ToString();
        var accessToken = authHeader.Replace("Bearer ", "").Trim();

        var command = new AddOrderItemCommand(
            id,
            restaurantId.Value,
            request.ProductId,
            request.Quantity,
            accessToken);

        await _mediator.Send(command);

        return NoContent();
    }

    [HttpPut("{id:guid}/pay")]
    public async Task<IActionResult> PayOrder(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new PayOrderCommand(id, restaurantId.Value);
        await _mediator.Send(command);

        return NoContent();
    }
}