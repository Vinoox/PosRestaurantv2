using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Entities;
using Ordering.Domain.Enums;
using Ordering.Domain.Interfaces;
using Ordering.Infrastructure.Data;

namespace Ordering.Infrastructure.Repositories;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(OrderingDbContext context) : base(context) { }

    public async Task<Order?> GetByIdWithDetailsAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .Include(o => o.Fulfillment)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
    }

    public async Task<Order?> GetOrderWithItemsAsync(Guid orderId, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.RestaurantId == restaurantId, cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetActiveOrdersAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .Include(o => o.Fulfillment)
            .Where(o => o.RestaurantId == restaurantId && o.Status != OrderStatus.Completed && o.Status != OrderStatus.Canceled)
            .ToListAsync(cancellationToken);
    }
}