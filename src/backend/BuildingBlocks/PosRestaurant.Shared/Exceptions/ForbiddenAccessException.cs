using System;

namespace PosRestaurant.Shared.Exceptions;

public class ForbiddenAccessException : Exception
{
    public string[] Errors { get; }

    public ForbiddenAccessException(string message) : base(message)
    {
        Errors = Array.Empty<string>();
    }

    public ForbiddenAccessException(string[] errors) : base("Wystąpiły błędy walidacji danych.")
    {
        Errors = errors;
    }
}