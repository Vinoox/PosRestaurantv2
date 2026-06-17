using MediatR;
using Identity.Application.Restaurants.Dtos;

namespace Identity.Application.Restaurants.Commands.RegisterRestaurant
{
    public record RegisterRestaurantCommand(RegisterRestaurantDto Dto) : IRequest<Guid>;
}