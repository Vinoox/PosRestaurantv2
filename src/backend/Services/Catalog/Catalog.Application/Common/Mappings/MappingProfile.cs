using AutoMapper;
using Catalog.Domain.Entities;
using Catalog.Application.Categories.Dtos;

namespace Catalog.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Category, CategoryDto>();
    }
}