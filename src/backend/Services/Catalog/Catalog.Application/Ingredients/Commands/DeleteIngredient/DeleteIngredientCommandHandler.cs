using System.Threading;
using System.Threading.Tasks;
using Catalog.Application.Common.Exceptions;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Ingredients.Commands.DeleteIngredient;

public class DeleteIngredientCommandHandler : IRequestHandler<DeleteIngredientCommand>
{
    private readonly IIngredientRepository _ingredientRepository;

    public DeleteIngredientCommandHandler(IIngredientRepository ingredientRepository)
    {
        _ingredientRepository = ingredientRepository;
    }

    public async Task Handle(DeleteIngredientCommand request, CancellationToken cancellationToken)
    {
        var ingredient = await _ingredientRepository.GetByIdAndRestaurantIdAsync(request.Id, request.RestaurantId, cancellationToken);

        if (ingredient == null)
        {
            throw new NotFoundException(nameof(Ingredient), request.Id);
        }

        await _ingredientRepository.DeleteAsync(ingredient, cancellationToken);
    }
}