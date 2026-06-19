using System.Linq;
using Catalog.Domain.Interfaces;
using FluentValidation;

namespace Catalog.Application.Products.Commands.UpdateProduct;

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    private readonly IProductRepository _productRepository;

    public UpdateProductCommandValidator(IProductRepository productRepository)
    {
        _productRepository = productRepository;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa produktu jest wymagana.")
            .MaximumLength(150).WithMessage("Nazwa nie może przekraczać 150 znaków.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                var exists = await _productRepository.ExistsByNameAsync(name, command.RestaurantId, excludeId: command.Id, cancellationToken: cancellationToken);
                return !exists;
            }).WithMessage("Inny produkt o takiej nazwie już istnieje.");

        RuleFor(v => v.Price)
            .GreaterThan(0).WithMessage("Cena musi być większa niż zero.");

        RuleFor(v => v.CategoryId)
            .NotEmpty().WithMessage("Kategoria jest wymagana.");

        RuleForEach(v => v.Ingredients).ChildRules(ingredients =>
        {
            ingredients.RuleFor(i => i.IngredientId).NotEmpty();
            ingredients.RuleFor(i => i.QuantityUsed).GreaterThan(0);
        });

        RuleFor(v => v.Ingredients)
            .Must(i => i.Select(x => x.IngredientId).Distinct().Count() == i.Count)
            .WithMessage("Ten sam składnik nie może zostać dodany wielokrotnie do receptury.");
    }
}