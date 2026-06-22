using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ordering.Domain.Entities;
using Ordering.Domain.Enums;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.Domain.Interfaces;

public interface IOrderRepository : IGenericRepository<Order>
{
    Task<Order?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetActiveOrdersAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetOrdersByStatusAsync(Guid restaurantId, OrderStatus status, CancellationToken cancellationToken = default);
}