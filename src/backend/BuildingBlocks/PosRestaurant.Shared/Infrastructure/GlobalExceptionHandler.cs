using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PosRestaurant.Shared.Exceptions;

namespace PosRestaurant.Shared.Infrastructure;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var problemDetails = new ProblemDetails { Instance = httpContext.Request.Path };

        switch (exception)
        {
            case ValidationAppException validationEx:
                httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Błąd walidacji żądania";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Detail = "Jeden lub więcej wprowadzonych parametrów jest niepoprawnych.";
                problemDetails.Extensions["errors"] = validationEx.Errors;
                break;

            case DomainException domainEx:
                httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Błąd logiki biznesowej";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Detail = domainEx.Message;
                break;

            case NotFoundException notFoundEx:
                httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                problemDetails.Title = "Zasób nie został znaleziony";
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Detail = notFoundEx.Message;
                break;

            case BadRequestException badReqEx:
                httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Nieprawidłowe żądanie";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Detail = badReqEx.Message;
                break;

            default:
                httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
                problemDetails.Title = "Wewnętrzny błąd serwera";
                problemDetails.Status = StatusCodes.Status500InternalServerError;
                problemDetails.Detail = "Wystąpił nieoczekiwany problem z przetworzeniem żądania.";
                break;
        }

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}