using System;

namespace Catalog.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"Zasób '{name}' ({key}) nie został znaleziony.")
    {
    }
}