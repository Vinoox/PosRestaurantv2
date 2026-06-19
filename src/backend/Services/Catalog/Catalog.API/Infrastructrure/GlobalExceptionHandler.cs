using System;
using System.Threading;
using System.Threading.Tasks;
using Catalog.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Infrastructure;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var problemDetails = new ProblemDetails
        {
            Instance = httpContext.Request.Path
        };

        if (exception is ValidationAppException validationEx)
        {
            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            problemDetails.Title = "Błąd walidacji żądania";
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Detail = "Jeden lub więcej wprowadzonych parametrów jest niepoprawnych.";

            problemDetails.Extensions["errors"] = validationEx.Errors;
        }
        else if (exception is NotFoundException notFoundEx)
        {
            httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            problemDetails.Title = "Zasób nie został znaleziony";
            problemDetails.Status = StatusCodes.Status404NotFound;
            problemDetails.Detail = notFoundEx.Message;
        }
        else
        {
            httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
            problemDetails.Title = "Wewnętrzny błąd serwera";
            problemDetails.Status = StatusCodes.Status500InternalServerError;
            problemDetails.Detail = "Wystąpił nieoczekiwany problem z przetworzeniem żądania.";

        }

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}