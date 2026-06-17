using System;

namespace PosRestaurant.Shared.Exceptions;

public class BadRequestException : Exception
{
    public string[] Errors { get; }

    public BadRequestException(string message) : base(message)
    {
        Errors = Array.Empty<string>();
    }

    public BadRequestException(string[] errors) : base("Wystąpiły błędy walidacji danych.")
    {
        Errors = errors;
    }
}