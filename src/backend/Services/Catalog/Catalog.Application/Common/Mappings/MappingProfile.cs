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

        CreateMap<ProductIngredient, ProductIngredientDto>()
            .ForMember(d => d.IngredientName, opt => opt.MapFrom(s => s.Ingredient != null ? s.Ingredient.Name : "Surowiec usunięty"))
            .ForMember(d => d.Unit, opt => opt.MapFrom(s => s.Ingredient != null ? s.Ingredient.Unit.ToString() : "szt"));

        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category != null ? s.Category.Name : "Brak kategorii"))
            .ForMember(d => d.Ingredients, opt => opt.MapFrom(s => s.ProductIngredients));
    }
}