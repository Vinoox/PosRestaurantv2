using MediatR;
using Identity.Application.Auth.Commands.Authenticate;

namespace Identity.Application.Auth.Commands.SelectRestaurant
{
    public record SelectRestaurantCommand(int RestaurantId) : IRequest<AuthenticationResultDto>;
}