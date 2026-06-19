using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Application.Orders.Dtos;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;

namespace Ordering.Application.Orders.Queries.GetOrderDetails;

public class GetOrderDetailsQueryHandler : IRequestHandler<GetOrderDetailsQuery, OrderDto>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderDetailsQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<OrderDto> Handle(GetOrderDetailsQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetOrderWithItemsAsync(request.OrderId, request.RestaurantId, cancellationToken);

        if (order == null)
            throw new NotFoundException($"Nie znaleziono zamówienia {request.OrderId}");

        return new OrderDto(
            order.Id,
            order.RestaurantId,
            order.Status.ToString(),
            order.TableNumber,
            order.TotalAmount,
            order.CreatedAt,
            order.Items.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.UnitPrice * i.Quantity
            )).ToList()
        );
    }
}