using Identity.Application.Auth.Commands.Authenticate;
using MediatR;

namespace Identity.Application.Auth.Commands.SelectRestaurant;

public record SelectRestaurantCommand(Guid RestaurantId) : IRequest<AuthenticationResultDto>;