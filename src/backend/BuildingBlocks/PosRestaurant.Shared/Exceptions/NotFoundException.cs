using System;

namespace PosRestaurant.Shared.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"Encja '{name}' o identyfikatorze ({key}) nie została znaleziona.")
    {
    }
}