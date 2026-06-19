using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Domain.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.Domain.Interfaces;

public interface IIngredientRepository : IGenericRepository<Ingredient>
{
    Task<bool> ExistsByNameAsync(string name, Guid restaurantId, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ingredient>> GetByRestaurantIdAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Ingredient?> GetByIdAndRestaurantIdAsync(Guid id, Guid restaurantId, CancellationToken cancellationToken = default);
}