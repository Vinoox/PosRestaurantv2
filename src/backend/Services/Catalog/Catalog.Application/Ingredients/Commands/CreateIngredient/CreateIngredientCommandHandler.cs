using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Catalog.Application.Ingredients.Dtos;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Ingredients.Commands.CreateIngredient;

public class CreateIngredientCommandHandler : IRequestHandler<CreateIngredientCommand, IngredientDto>
{
    private readonly IIngredientRepository _ingredientRepository;
    private readonly IMapper _mapper;

    public CreateIngredientCommandHandler(IIngredientRepository ingredientRepository, IMapper mapper)
    {
        _ingredientRepository = ingredientRepository;
        _mapper = mapper;
    }

    public async Task<IngredientDto> Handle(CreateIngredientCommand request, CancellationToken cancellationToken)
    {
        var ingredient = new Ingredient
        {
            Name = request.Name,
            Unit = request.Unit,
            StockQuantity = request.InitialStock,
            RestaurantId = request.RestaurantId
        };

        var createdIngredient = await _ingredientRepository.AddAsync(ingredient, cancellationToken);

        return _mapper.Map<IngredientDto>(createdIngredient);
    }
}