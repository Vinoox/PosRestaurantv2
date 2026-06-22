using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Domain.Entities;
using Ordering.Domain.Entities.Fulfillments;
using Ordering.Domain.Interfaces;
using PosRestaurant.Shared.Exceptions;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.Application.Orders.Commands.CompleteOrder;

public class CompleteOrderCommandHandler : IRequestHandler<CompleteOrderCommand>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IGenericRepository<Table> _tableRepository;

    public CompleteOrderCommandHandler(IOrderRepository orderRepository, IGenericRepository<Table> tableRepository)
    {
        _orderRepository = orderRepository;
        _tableRepository = tableRepository;
    }

    public async Task Handle(CompleteOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId, cancellationToken);
        if (order == null || order.RestaurantId != request.RestaurantId)
            throw new NotFoundException(nameof(Order), request.OrderId);

        order.MarkAsCompleted();

        if (order.Fulfillment is DineInFulfillment dineIn)
        {
            var table = await _tableRepository.GetByIdAsync(dineIn.TableId, cancellationToken);
            if (table != null)
            {
                table.Release();
                await _tableRepository.UpdateAsync(table, cancellationToken);
            }
        }

        await _orderRepository.UpdateAsync(order, cancellationToken);
    }
}