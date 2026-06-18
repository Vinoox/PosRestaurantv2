using Catalog.Domain.Interfaces;
using FluentValidation;

namespace Catalog.Application.Categories.Commands.UpdateCategory;

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    private readonly ICategoryRepository _categoryRepository;

    public UpdateCategoryCommandValidator(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa kategorii jest wymagana.")
            .MaximumLength(100).WithMessage("Nazwa nie może przekraczać 100 znaków.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                var exists = await _categoryRepository.ExistsByNameAsync(name, command.RestaurantId, command.Id, cancellationToken);
                return !exists;
            }).WithMessage("Inna kategoria o takiej nazwie już istnieje.");
    }
}