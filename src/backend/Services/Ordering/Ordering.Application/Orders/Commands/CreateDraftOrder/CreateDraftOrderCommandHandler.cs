using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Ordering.Domain.Entities;
using Ordering.Domain.Interfaces;

namespace Ordering.Application.Orders.Commands.CreateDraftOrder;

public class CreateDraftOrderCommandHandler : IRequestHandler<CreateDraftOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepository;

    public CreateDraftOrderCommandHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Guid> Handle(CreateDraftOrderCommand request, CancellationToken cancellationToken)
    {
        var order = Order.Create(request.RestaurantId);
        await _orderRepository.AddAsync(order, cancellationToken);

        return order.Id;
    }
}