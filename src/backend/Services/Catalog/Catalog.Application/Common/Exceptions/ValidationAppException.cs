using System;
using System.Collections.Generic;

namespace Catalog.Application.Common.Exceptions;

public class ValidationAppException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationAppException()
        : base("Wystąpiły błędy walidacji.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationAppException(IDictionary<string, string[]> errors)
        : base("Wystąpiły błędy walidacji.")
    {
        Errors = errors;
    }
}