using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Contracts;
using Ordering.Application.Orders.Commands.AddOrderItem;
using Ordering.Application.Orders.Commands.CreateOrder;
using Ordering.Application.Orders.Commands.PayOrder;
using Ordering.Application.Orders.Commands.RemoveOrderItem;
using Ordering.Application.Orders.Queries.GetActiveOrders;
using Ordering.Application.Orders.Queries.GetOrderDetails;
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

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveOrders()
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var query = new GetActiveOrdersQuery(restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderDetails(Guid id)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var query = new GetOrderDetailsQuery(id, restaurantId.Value);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var restaurantId = _currentUserProvider.RestaurantId;
        if (restaurantId == null) return Unauthorized();

        var command = new RemoveOrderItemCommand(id, itemId, restaurantId.Value);
        await _mediator.Send(command);

        return NoContent();
    }
}