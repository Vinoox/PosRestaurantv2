using System;
using System.Collections.Generic;

namespace PosRestaurant.Shared.Exceptions;

public class ValidationAppException : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationAppException(IReadOnlyDictionary<string, string[]> errors)
        : base("Wystąpiły błędy walidacji.")
    {
        Errors = errors;
    }
}