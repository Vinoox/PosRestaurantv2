using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Catalog.Application.Common.Exceptions;
using Catalog.Application.Ingredients.Dtos;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Ingredients.Queries.GetIngredientById;

public class GetIngredientByIdQueryHandler : IRequestHandler<GetIngredientByIdQuery, IngredientDto>
{
    private readonly IIngredientRepository _ingredientRepository;
    private readonly IMapper _mapper;

    public GetIngredientByIdQueryHandler(IIngredientRepository ingredientRepository, IMapper mapper)
    {
        _ingredientRepository = ingredientRepository;
        _mapper = mapper;
    }

    public async Task<IngredientDto> Handle(GetIngredientByIdQuery request, CancellationToken cancellationToken)
    {
        var ingredient = await _ingredientRepository.GetByIdAndRestaurantIdAsync(request.Id, request.RestaurantId, cancellationToken);

        if (ingredient == null)
        {
            throw new NotFoundException(nameof(Ingredient), request.Id);
        }

        return _mapper.Map<IngredientDto>(ingredient);
    }
}