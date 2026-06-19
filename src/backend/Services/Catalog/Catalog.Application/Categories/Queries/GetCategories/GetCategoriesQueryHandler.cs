using AutoMapper;
using Catalog.Application.Categories.Dtos;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Categories.Queries.GetCategories;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public GetCategoriesQueryHandler(ICategoryRepository categoryRepository, IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetByRestaurantIdAsync(request.RestaurantId, cancellationToken);

        return _mapper.Map<IReadOnlyList<CategoryDto>>(categories);
    }
}