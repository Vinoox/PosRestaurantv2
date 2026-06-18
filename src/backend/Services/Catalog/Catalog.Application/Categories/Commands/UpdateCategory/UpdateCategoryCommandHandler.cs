using System.Threading;
using System.Threading.Tasks;
using Catalog.Application.Common.Exceptions;
using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using MediatR;

namespace Catalog.Application.Categories.Commands.UpdateCategory;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand>
{
    private readonly ICategoryRepository _categoryRepository;

    public UpdateCategoryCommandHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAndRestaurantIdAsync(request.Id, request.RestaurantId, cancellationToken);

        if (category == null)
        {
            throw new NotFoundException(nameof(Category), request.Id);
        }

        category.Name = request.Name;
        category.Description = request.Description;

        await _categoryRepository.UpdateAsync(category, cancellationToken);
    }
}