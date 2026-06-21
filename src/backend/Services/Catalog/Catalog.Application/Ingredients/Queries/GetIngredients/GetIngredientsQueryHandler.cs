using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Catalog.Application.Ingredients.Queries.GetIngredients
{
    public class GetIngredientsQueryHandler : IRequestHandler<GetIngredientsQuery, IReadOnlyList<IngredientListItemDto>>
{
    private readonly ICatalogDbContext _context;

    public GetIngredientsQueryHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<IngredientListItemDto>> Handle(GetIngredientsQuery request, CancellationToken cancellationToken)
    {
        var ingredients = await _context.Ingredients
            .Where(i => i.RestaurantId == request.RestaurantId)
            .ToListAsync(cancellationToken);

        return ingredients.Select(i => new IngredientListItemDto(
            i.Id,
            i.Name,
            i.Unit,
            i.Stock // <--- UWAGA: Sprawdź w encji Ingredient jak nazywa się pole ze stanem magazynowym (Stock, CurrentStock, Quantity) i wpisz tu poprawną nazwę
        )).ToList();
    }
}