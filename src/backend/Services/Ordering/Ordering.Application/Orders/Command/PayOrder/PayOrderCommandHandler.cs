using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Domain.Interfaces;

namespace Ordering.Application.Orders.Commands.PayOrder;

public class PayOrderCommandHandler : IRequestHandler<PayOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;

    public PayOrderCommandHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Unit> Handle(PayOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetOrderWithItemsAsync(request.OrderId, request.RestaurantId, cancellationToken);

        if (order == null)
        {
            throw new Exception($"Nie znaleziono zamówienia {request.OrderId}");
        }

        order.MarkAsPaid();

        await _orderRepository.UpdateAsync(order, cancellationToken);

        return Unit.Value;
    }
}