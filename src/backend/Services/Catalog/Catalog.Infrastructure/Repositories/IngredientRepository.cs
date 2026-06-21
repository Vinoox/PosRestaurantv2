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

public class IngredientRepository : GenericRepository<Ingredient>, IIngredientRepository
{
    public IngredientRepository(CatalogDbContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(string name, Guid restaurantId, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Ingredients
            .Where(i => i.Name.ToLower() == name.ToLower() && i.RestaurantId == restaurantId);

        if (excludeId.HasValue)
        {
            query = query.Where(i => i.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Ingredient>> GetByRestaurantIdAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Ingredients
            .AsNoTracking()
            .Where(i => i.RestaurantId == restaurantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Ingredient?> GetByIdAndRestaurantIdAsync(Guid id, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Ingredients
            .FirstOrDefaultAsync(i => i.Id == id && i.RestaurantId == restaurantId, cancellationToken);
    }
}