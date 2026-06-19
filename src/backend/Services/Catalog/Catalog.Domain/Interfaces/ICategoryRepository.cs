using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Domain.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.Domain.Interfaces;

public interface ICategoryRepository : IGenericRepository<Category>
{
    Task<bool> ExistsByNameAsync(string name, Guid restaurantId, Guid? excludeId = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Category>> GetByRestaurantIdAsync(Guid restaurantId, CancellationToken cancellationToken = default);

    Task<Category?> GetByIdAndRestaurantIdAsync(Guid id, Guid restaurantId, CancellationToken cancellationToken = default);
}