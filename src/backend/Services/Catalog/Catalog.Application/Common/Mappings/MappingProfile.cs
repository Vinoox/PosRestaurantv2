using AutoMapper;
using Catalog.Application.Categories.Dtos;
using Catalog.Application.Ingredients.Dtos;
using Catalog.Application.Products.Dtos;
using Catalog.Domain.Entities;

namespace Catalog.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Category, CategoryDto>();
        CreateMap<Ingredient, IngredientDto>();

        CreateMap<ProductIngredient, ProductIngredientDto>()
            .ForMember(d => d.IngredientName, opt => opt.MapFrom(s => s.Ingredient.Name));

        CreateMap<Product, ProductDto>()
            .ForMember(d => d.Ingredients, opt => opt.MapFrom(s => s.ProductIngredients));
    }
}