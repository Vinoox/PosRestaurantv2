using Identity.Application.Auth.Commands.Authenticate;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using PosRestaurant.Shared.Interfaces;

namespace Identity.Application.Auth.Commands.SelectRestaurant;

public class SelectRestaurantCommandHandler : IRequestHandler<SelectRestaurantCommand, AuthenticationResultDto>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ICurrentUserProvider _currentUserProvider;

    public SelectRestaurantCommandHandler(
        UserManager<User> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        ICurrentUserProvider currentUserProvider)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<AuthenticationResultDto> Handle(SelectRestaurantCommand request, CancellationToken cancellationToken)
    {
        // 1. Bezpieczne rzutowanie na string, niezależnie od tego czy Twój interfejs zwraca string? czy Guid?
        var userIdString = _currentUserProvider.UserId?.ToString();

        // 2. Weryfikacja stringa (zamiast operatora == Guid.Empty)
        if (string.IsNullOrWhiteSpace(userIdString) || userIdString == Guid.Empty.ToString())
        {
            throw new UnauthorizedAccessException("Brak zalogowanego użytkownika lub niepoprawny token.");
        }

        // 3. UserManager od razu przyjmuje czystego stringa
        var user = await _userManager.FindByIdAsync(userIdString);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Nie znaleziono użytkownika w systemie.");
        }

        var globalRoles = await _userManager.GetRolesAsync(user);

        // 4. Generowanie tokenu
        var authToken = _jwtTokenGenerator.GenerateAuthenticationToken(user, globalRoles, request.RestaurantId);

        return new AuthenticationResultDto
        {
            UserId = user.Id.ToString(),
            AuthenticationToken = authToken
        };
    }
}