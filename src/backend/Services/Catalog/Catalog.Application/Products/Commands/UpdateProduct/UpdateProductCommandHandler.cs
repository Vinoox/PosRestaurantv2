using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Application.Common.Exceptions;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Products.Commands.UpdateProduct;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand>
{
    private readonly IProductRepository _productRepository;

    public UpdateProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdWithIngredientsAsync(request.Id, request.RestaurantId, cancellationToken);

        if (product == null)
        {
            throw new NotFoundException(nameof(Product), request.Id);
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.CategoryId = request.CategoryId;

        product.ProductIngredients.Clear();

        foreach (var ingredient in request.Ingredients)
        {
            product.ProductIngredients.Add(new ProductIngredient
            {
                IngredientId = ingredient.IngredientId,
                QuantityUsed = ingredient.QuantityUsed
            });
        }

        await _productRepository.UpdateAsync(product, cancellationToken);
    }
}