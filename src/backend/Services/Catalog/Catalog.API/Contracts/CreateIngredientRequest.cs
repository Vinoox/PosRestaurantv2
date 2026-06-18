using Catalog.Domain.Enums;

namespace Catalog.API.Contracts;

public record CreateIngredientRequest(string Name, Unit Unit, decimal InitialStock);