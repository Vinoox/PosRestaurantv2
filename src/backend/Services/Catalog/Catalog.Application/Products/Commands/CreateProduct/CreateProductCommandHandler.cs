using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Catalog.Application.Products.Dtos;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Products.Commands.CreateProduct;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public CreateProductCommandHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            RestaurantId = request.RestaurantId,

            ProductIngredients = request.Ingredients.Select(i => new ProductIngredient
            {
                IngredientId = i.IngredientId,
                QuantityUsed = i.QuantityUsed
            }).ToList()
        };

        var createdProduct = await _productRepository.AddAsync(product, cancellationToken);

        return _mapper.Map<ProductDto>(createdProduct);
    }
}