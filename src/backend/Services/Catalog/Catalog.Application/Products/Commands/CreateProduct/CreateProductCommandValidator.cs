using System.Linq;
using Catalog.Domain.Interfaces;
using FluentValidation;

namespace Catalog.Application.Products.Commands.CreateProduct;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    private readonly IProductRepository _productRepository;

    public CreateProductCommandValidator(IProductRepository productRepository)
    {
        _productRepository = productRepository;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa produktu jest wymagana.")
            .MaximumLength(150).WithMessage("Nazwa nie może przekraczać 150 znaków.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                var exists = await _productRepository.ExistsByNameAsync(name, command.RestaurantId, cancellationToken: cancellationToken);
                return !exists;
            }).WithMessage("Produkt o takiej nazwie już istnieje w menu.");

        RuleFor(v => v.Price)
            .GreaterThan(0).WithMessage("Cena musi być większa niż zero.");

        RuleFor(v => v.CategoryId)
            .NotEmpty().WithMessage("Kategoria jest wymagana.");

        RuleForEach(v => v.Ingredients).ChildRules(ingredients =>
        {
            ingredients.RuleFor(i => i.IngredientId)
                .NotEmpty().WithMessage("Identyfikator składnika jest wymagany.");

            ingredients.RuleFor(i => i.QuantityUsed)
                .GreaterThan(0).WithMessage("Zużycie składnika musi być większe niż 0.");
        });

        RuleFor(v => v.Ingredients)
            .Must(i => i.Select(x => x.IngredientId).Distinct().Count() == i.Count)
            .WithMessage("Ten sam składnik nie może zostać dodany wielokrotnie do receptury.");
    }
}