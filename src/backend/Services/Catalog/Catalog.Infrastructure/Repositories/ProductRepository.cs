using System;
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

    public async Task<bool> ExistsByNameAsync(string name, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .AnyAsync(p => p.Name.ToLower() == name.ToLower() && p.RestaurantId == restaurantId, cancellationToken);
    }

    public async Task<Product?> GetWithIngredientsAsync(Guid id, Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.ProductIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId, cancellationToken);
    }
}