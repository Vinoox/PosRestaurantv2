using System;
using MediatR;

namespace Catalog.Application.Categories.Commands.DeleteCategory;

public record DeleteCategoryCommand(Guid Id, Guid RestaurantId) : IRequest;