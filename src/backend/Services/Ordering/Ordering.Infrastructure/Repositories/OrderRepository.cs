using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Entities;
using Ordering.Domain.Entities.Fulfillments;
using Ordering.Domain.Enums;
using Ordering.Domain.Interfaces;
using Ordering.Infrastructure.Data;

namespace Ordering.Infrastructure.Repositories;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    private readonly OrderingDbContext _context;

    public OrderRepository(OrderingDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Fulfillment!)
                .ThenInclude(f => ((DineInFulfillment)f).Table)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetActiveOrdersAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Fulfillment!)
                .ThenInclude(f => ((DineInFulfillment)f).Table)
            .Where(o => o.RestaurantId == restaurantId && o.Status < OrderStatus.Completed)
            .OrderBy(o => o.OrderDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetOrdersByStatusAsync(Guid restaurantId, OrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Fulfillment!)
                .ThenInclude(f => ((DineInFulfillment)f).Table)
            .Where(o => o.RestaurantId == restaurantId && o.Status == status)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(cancellationToken);
    }
}