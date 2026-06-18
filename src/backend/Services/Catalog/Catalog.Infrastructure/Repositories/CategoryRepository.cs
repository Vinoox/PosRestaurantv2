using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using Catalog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Infrastructure.Repositories;

public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    public CategoryRepository(CatalogDbContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(string name, Guid restaurantId, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Categories
            .Where(c => c.Name.ToLower() == name.ToLower() && c.RestaurantId == restaurantId);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetByRestaurantIdAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Where(c => c.RestaurantId == restaurantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetByIdAndRestaurantIdAsync(Guid id, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.RestaurantId == restaurantId, cancellationToken);
    }
}