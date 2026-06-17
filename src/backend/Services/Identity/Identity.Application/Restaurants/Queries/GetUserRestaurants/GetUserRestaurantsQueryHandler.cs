using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.Restaurants.Queries.GetUserRestaurants
{
    public class GetUserRestaurantsQueryHandler : IRequestHandler<GetUserRestaurantsQuery, List<RestaurantDto>>
    {
        private readonly IIdentityDbContext _context;

        public GetUserRestaurantsQueryHandler(IIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<List<RestaurantDto>> Handle(GetUserRestaurantsQuery request, CancellationToken cancellationToken)
        {
            var restaurants = await _context.RestaurantMembers
                .AsNoTracking()
                .Where(rm => rm.UserId == request.UserId)
                .Select(rm => new RestaurantDto
                {
                    Id = rm.Restaurant.Id,
                    Name = rm.Restaurant.Name,
                    UserRole = rm.RestaurantRole.Name
                })
                .ToListAsync(cancellationToken);

            return restaurants;
        }
    }
}