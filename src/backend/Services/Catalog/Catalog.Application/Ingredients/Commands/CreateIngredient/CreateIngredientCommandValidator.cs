using Catalog.Domain.Interfaces;
using FluentValidation;

namespace Catalog.Application.Ingredients.Commands.CreateIngredient;

public class CreateIngredientCommandValidator : AbstractValidator<CreateIngredientCommand>
{
    private readonly IIngredientRepository _ingredientRepository;

    public CreateIngredientCommandValidator(IIngredientRepository ingredientRepository)
    {
        _ingredientRepository = ingredientRepository;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa składnika jest wymagana.")
            .MaximumLength(100).WithMessage("Nazwa nie może przekraczać 100 znaków.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                var exists = await _ingredientRepository.ExistsByNameAsync(name, command.RestaurantId, cancellationToken: cancellationToken);
                return !exists;
            }).WithMessage("Składnik o takiej nazwie już istnieje w magazynie tej restauracji.");

        RuleFor(v => v.InitialStock)
            .GreaterThanOrEqualTo(0).WithMessage("Początkowy stan magazynowy nie może być ujemny.");

        RuleFor(v => v.Unit)
            .IsInEnum().WithMessage("Podano nieprawidłową jednostkę miary.");
    }
}