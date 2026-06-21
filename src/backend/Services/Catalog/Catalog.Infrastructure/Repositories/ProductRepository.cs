using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using Catalog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;


namespace Catalog.Infrastructure.Repositories;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(CatalogDbContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(string name, Guid restaurantId, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Where(p => p.Name.ToLower() == name.ToLower() && p.RestaurantId == restaurantId);

        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<Product?> GetByIdWithIngredientsAsync(Guid id, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.ProductIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId, cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetByRestaurantIdAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.ProductIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .Where(p => p.RestaurantId == restaurantId)
            .ToListAsync(cancellationToken);
    }
}