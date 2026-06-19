using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Restaurants.Queries.GetRestaurantDetails
{
    public class GetRestaurantDetailsQueryHandler : IRequestHandler<GetRestaurantDetailsQuery, RestaurantDetailsDto>
    {
        private readonly IIdentityDbContext _context;

        public GetRestaurantDetailsQueryHandler(IIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<RestaurantDetailsDto> Handle(GetRestaurantDetailsQuery request, CancellationToken cancellationToken)
        {
            var hasAccess = await _context.RestaurantMembers
                .AnyAsync(rm => rm.RestaurantId == request.RestaurantId && rm.UserId == request.RequesterId, cancellationToken);

            if (!hasAccess)
                throw new ForbiddenAccessException("Nie masz dostępu do danych tej restauracji.");

            var details = await _context.Restaurants
                .AsNoTracking()
                .Where(r => r.Id == request.RestaurantId)
                .Select(r => new RestaurantDetailsDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Address = r.Address,
                    TaxId = r.TaxId,
                    IsActive = r.IsActive,
                    CreatedAt = r.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (details == null)
                throw new NotFoundException("Restauracja", request.RestaurantId);

            return details;
        }
    }
}