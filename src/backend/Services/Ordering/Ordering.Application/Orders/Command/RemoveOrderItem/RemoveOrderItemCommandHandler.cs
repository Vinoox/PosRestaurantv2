using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;

namespace Ordering.Application.Orders.Commands.RemoveOrderItem;

public class RemoveOrderItemCommandHandler : IRequestHandler<RemoveOrderItemCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;

    public RemoveOrderItemCommandHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Unit> Handle(RemoveOrderItemCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetOrderWithItemsAsync(request.OrderId, request.RestaurantId, cancellationToken);

        if (order == null)
            throw new NotFoundException($"Nie znaleziono zamówienia {request.OrderId}");

        order.RemoveItem(request.OrderItemId);

        await _orderRepository.UpdateAsync(order, cancellationToken);

        return Unit.Value;
    }
}