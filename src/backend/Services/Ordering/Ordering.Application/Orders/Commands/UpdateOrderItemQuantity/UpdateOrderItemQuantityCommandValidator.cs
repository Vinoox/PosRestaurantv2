using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Domain.Entities;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;

namespace Ordering.Application.Orders.Commands.UpdateOrderItemQuantity;

public class UpdateOrderItemQuantityCommandHandler : IRequestHandler<UpdateOrderItemQuantityCommand>
{
    private readonly IOrderRepository _orderRepository;

    public UpdateOrderItemQuantityCommandHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task Handle(UpdateOrderItemQuantityCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);
        if (order == null || order.RestaurantId != request.RestaurantId)
            throw new NotFoundException(nameof(Order), request.OrderId);

        order.UpdateOrderItemQuantity(request.OrderItemIdOrProductId, request.Quantity);
        await _orderRepository.UpdateAsync(order, cancellationToken);
    }
}