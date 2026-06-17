using System;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Domain.Entities;
using PosRestaurant.Shared.Interfaces;

namespace Catalog.Domain.Interfaces;

public interface IIngredientRepository : IGenericRepository<Ingredient>
{
    Task<bool> ExistsByNameAsync(string name, Guid restaurantId, CancellationToken cancellationToken = default);
}