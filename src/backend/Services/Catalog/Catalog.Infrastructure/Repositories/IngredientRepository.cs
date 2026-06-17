using System;
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

    public async Task<bool> ExistsByNameAsync(string name, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Ingredients
            .AnyAsync(i => i.Name.ToLower() == name.ToLower() && i.RestaurantId == restaurantId, cancellationToken);
    }
}