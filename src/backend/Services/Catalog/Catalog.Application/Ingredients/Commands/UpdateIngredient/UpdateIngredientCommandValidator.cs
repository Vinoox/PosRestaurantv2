using Catalog.Domain.Interfaces;
using FluentValidation;

namespace Catalog.Application.Ingredients.Commands.UpdateIngredient;

public class UpdateIngredientCommandValidator : AbstractValidator<UpdateIngredientCommand>
{
    private readonly IIngredientRepository _ingredientRepository;

    public UpdateIngredientCommandValidator(IIngredientRepository ingredientRepository)
    {
        _ingredientRepository = ingredientRepository;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa składnika jest wymagana.")
            .MaximumLength(100).WithMessage("Nazwa nie może przekraczać 100 znaków.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                var exists = await _ingredientRepository.ExistsByNameAsync(name, command.RestaurantId, command.Id, cancellationToken);
                return !exists;
            }).WithMessage("Inny składnik o takiej nazwie już istnieje.");

        RuleFor(v => v.Unit)
            .IsInEnum().WithMessage("Podano nieprawidłową jednostkę miary.");
    }
}