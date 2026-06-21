using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Catalog.Application.Ingredients.Dtos;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Ingredients.Queries.GetIngredients;

public class GetIngredientsQueryHandler : IRequestHandler<GetIngredientsQuery, IEnumerable<IngredientDto>>
{
    private readonly IIngredientRepository _ingredientRepository;
    private readonly IMapper _mapper;

    public GetIngredientsQueryHandler(IIngredientRepository ingredientRepository, IMapper mapper)
    {
        _ingredientRepository = ingredientRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<IngredientDto>> Handle(GetIngredientsQuery request, CancellationToken cancellationToken)
    {
        // Analogicznie do Twojego GetByIdAndRestaurantIdAsync
        var ingredients = await _ingredientRepository.GetByRestaurantIdAsync(request.RestaurantId, cancellationToken);

        // AutoMapper w C# automatycznie potrafi zmapować kolekcję encji na kolekcję DTO
        return _mapper.Map<IEnumerable<IngredientDto>>(ingredients);
    }
}