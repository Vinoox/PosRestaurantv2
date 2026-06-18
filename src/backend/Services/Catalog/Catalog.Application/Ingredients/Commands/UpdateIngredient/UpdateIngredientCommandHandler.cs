using System.Threading;
using System.Threading.Tasks;
using Catalog.Application.Common.Exceptions;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Ingredients.Commands.UpdateIngredient;

public class UpdateIngredientCommandHandler : IRequestHandler<UpdateIngredientCommand>
{
    private readonly IIngredientRepository _ingredientRepository;

    public UpdateIngredientCommandHandler(IIngredientRepository ingredientRepository)
    {
        _ingredientRepository = ingredientRepository;
    }

    public async Task Handle(UpdateIngredientCommand request, CancellationToken cancellationToken)
    {
        var ingredient = await _ingredientRepository.GetByIdAndRestaurantIdAsync(request.Id, request.RestaurantId, cancellationToken);

        if (ingredient == null)
        {
            throw new NotFoundException(nameof(Ingredient), request.Id);
        }

        ingredient.Name = request.Name;
        ingredient.Unit = request.Unit;

        await _ingredientRepository.UpdateAsync(ingredient, cancellationToken);
    }
}