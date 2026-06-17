using System;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Domain.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.Domain.Interfaces;

public interface IProductRepository : IGenericRepository<Product>
{
    Task<bool> ExistsByNameAsync(string name, Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Product?> GetWithIngredientsAsync(Guid id, Guid restaurantId, CancellationToken cancellationToken = default);
}