using System;
using System.Threading;
using System.Threading.Tasks;
using Ordering.Domain.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Ordering.Domain.Interfaces;

public interface IOrderRepository : IGenericRepository<Order>
{
    Task<Order?> GetOrderWithItemsAsync(Guid orderId, Guid restaurantId, CancellationToken cancellationToken = default);
}