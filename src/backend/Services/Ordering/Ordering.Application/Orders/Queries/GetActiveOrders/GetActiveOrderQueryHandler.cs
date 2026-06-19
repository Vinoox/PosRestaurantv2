using MediatR;
using Ordering.Application.Orders.Dtos;
using Ordering.Domain.Interfaces;

namespace Ordering.Application.Orders.Queries.GetActiveOrders;

public class GetActiveOrdersQueryHandler : IRequestHandler<GetActiveOrdersQuery, List<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetActiveOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<List<OrderDto>> Handle(GetActiveOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetActiveOrdersAsync(request.RestaurantId, cancellationToken);

        return orders.Select(o => new OrderDto(
            o.Id,
            o.RestaurantId,
            o.Status.ToString(),
            o.TableNumber,
            o.TotalAmount,
            o.CreatedAt,
            o.Items.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.UnitPrice * i.Quantity
            )).ToList()
        )).ToList();
    }
}