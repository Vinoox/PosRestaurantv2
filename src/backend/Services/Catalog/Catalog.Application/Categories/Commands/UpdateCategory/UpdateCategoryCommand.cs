using System;
using MediatR;

namespace Catalog.Application.Categories.Commands.UpdateCategory;

public record UpdateCategoryCommand(Guid Id, string Name, string? Description, Guid RestaurantId) : IRequest;