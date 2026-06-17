using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Identity.Application.Auth.Commands.Authenticate;

namespace Identity.Application.Auth.Commands.SelectRestaurant
{
    public class SelectRestaurantCommandHandler : IRequestHandler<SelectRestaurantCommand, AuthenticationResultDto>
    {
        public async Task<AuthenticationResultDto> Handle(SelectRestaurantCommand request, CancellationToken cancellationToken)
        {
            // TODO: Zaimplementuj pobranie użytkownika
            // TODO: Sprawdź czy użytkownik ma przypisaną restaurację (request.RestaurantId)
            // TODO: Wygeneruj nowy token z "ClaimTypes.UserData" ustawionym na ID restauracji

            return new AuthenticationResultDto
            {
                UserId = "temp",
                AuthenticationToken = "nowy_token"
            };
        }
    }
}