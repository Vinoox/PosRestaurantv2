using Identity.Application.Auth.Commands.Authenticate;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Interfaces;

namespace Identity.Application.Auth.Commands.SelectRestaurant;

public class SelectRestaurantCommandHandler : IRequestHandler<SelectRestaurantCommand, AuthenticationResultDto>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ICurrentUserProvider _currentUserProvider;
    private readonly IIdentityDbContext _context;

    public SelectRestaurantCommandHandler(
        UserManager<User> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        ICurrentUserProvider currentUserProvider,
        IIdentityDbContext context)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _currentUserProvider = currentUserProvider;
        _context = context;
    }

    public async Task<AuthenticationResultDto> Handle(SelectRestaurantCommand request, CancellationToken cancellationToken)
    {
        var userIdString = _currentUserProvider.UserId?.ToString();

        if (string.IsNullOrWhiteSpace(userIdString) || userIdString == Guid.Empty.ToString())
        {
            throw new UnauthorizedAccessException("Brak zalogowanego użytkownika lub niepoprawny token.");
        }

        var user = await _userManager.FindByIdAsync(userIdString);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Nie znaleziono użytkownika w systemie.");
        }

        var restaurantRole = await _context.RestaurantMembers
            .Where(rm => rm.UserId == user.Id && rm.RestaurantId == request.RestaurantId)
            .Select(rm => rm.RestaurantRole.Name)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(restaurantRole))
        {
            throw new UnauthorizedAccessException("Odmowa dostępu. Nie jesteś przypisany do tej restauracji.");
        }

        var globalRoles = await _userManager.GetRolesAsync(user);

        var authToken = _jwtTokenGenerator.GenerateAuthenticationToken(
            user,
            globalRoles,
            request.RestaurantId,
            restaurantRole);

        return new AuthenticationResultDto
        {
            UserId = user.Id.ToString(),
            AuthenticationToken = authToken
        };
    }
}