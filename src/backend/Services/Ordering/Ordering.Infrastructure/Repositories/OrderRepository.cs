using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Entities;
using Ordering.Domain.Interfaces;
using Ordering.Infrastructure.Data;

namespace Ordering.Infrastructure.Repositories;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(OrderingDbContext context) : base(context) { }

    public async Task<Order?> GetOrderWithItemsAsync(Guid orderId, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.RestaurantId == restaurantId, cancellationToken);
    }
}