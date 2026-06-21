using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Catalog.Application.Ingredients.Queries.GetIngredients
{
    public record GetIngredientsQuery(Guid RestaurantId) : IRequest<IReadOnlyList<IngredientListItemDto>>;

    public record IngredientListItemDto(
        Guid Id,
        string Name,
        string Unit,
        decimal Stock
    );
}