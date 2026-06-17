using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PosRestaurant.Shared.Exceptions;
using FluentValidation;

namespace Identity.API.Infrastructure
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var problemDetails = new ProblemDetails
            {
                Instance = httpContext.Request.Path
            };

            if (exception is ValidationException validationException)
            {
                problemDetails.Title = "Błąd walidacji danych wejściowych";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Detail = "Jedno lub więcej pól nie spełnia reguł walidacji.";

                var errors = validationException.Errors
                    .GroupBy(x => x.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(x => x.ErrorMessage).ToArray()
                    );

                problemDetails.Extensions.Add("errors", errors);
            }
            else if (exception is BadRequestException badRequestException)
            {
                problemDetails.Title = "Bad Request";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Detail = badRequestException.Message;
            }
            else if (exception is NotFoundException notFoundException)
            {
                problemDetails.Title = "Not Found";
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Detail = notFoundException.Message;
            }
            else
            {
                problemDetails.Title = "Internal Server Error";
                problemDetails.Status = StatusCodes.Status500InternalServerError;
                problemDetails.Detail = exception.Message;
            }

            httpContext.Response.StatusCode = problemDetails.Status.Value;
            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}