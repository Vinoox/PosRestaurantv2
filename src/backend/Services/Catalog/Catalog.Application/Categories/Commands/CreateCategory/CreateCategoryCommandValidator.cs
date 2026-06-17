using Catalog.Domain.Interfaces;
using FluentValidation;

namespace Catalog.Application.Categories.Commands.CreateCategory;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    private readonly ICategoryRepository _categoryRepository;

    public CreateCategoryCommandValidator(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;

        RuleFor(v => v.RestaurantId)
            .NotEmpty().WithMessage("Identyfikator restauracji jest wymagany.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa kategorii jest wymagana.")
            .MaximumLength(100).WithMessage("Nazwa kategorii nie może przekraczać 100 znaków.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                var exists = await _categoryRepository.ExistsByNameAsync(name, command.RestaurantId, cancellationToken);
                return !exists;
            }).WithMessage("Kategoria o takiej nazwie już istnieje w tej restauracji.");
    }
}