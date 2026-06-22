using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Domain.Entities;
using Ordering.Domain.Enums;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;

namespace Ordering.Application.Orders.Commands.RemoveOrderItem;

public class RemoveOrderItemCommandHandler : IRequestHandler<RemoveOrderItemCommand>
{
    private readonly IOrderRepository _orderRepository;

    public RemoveOrderItemCommandHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task Handle(RemoveOrderItemCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);
        if (order == null || order.RestaurantId != request.RestaurantId)
            throw new NotFoundException(nameof(Order), request.OrderId);

        if (order.Status == OrderStatus.Completed)
            throw new BadRequestException("Nie można usuwać pozycji ze zrealizowanego zamówienia.");

        order.RemoveOrderItem(request.ProductId);

        await _orderRepository.UpdateAsync(order, cancellationToken);
    }
}