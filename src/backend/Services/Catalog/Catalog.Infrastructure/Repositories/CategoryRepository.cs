using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using Catalog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Infrastructure.Repositories;

public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    public CategoryRepository(CatalogDbContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(string name, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .AnyAsync(c => c.Name.ToLower() == name.ToLower() && c.RestaurantId == restaurantId, cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetByRestaurantIdAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Where(c => c.RestaurantId == restaurantId)
            .ToListAsync(cancellationToken);
    }
}