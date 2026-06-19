using PosRestaurant.Shared.Exceptions;

namespace Identity.Domain.Exceptions;

public class IdentityDomainException : DomainException
{
    public IdentityDomainException(string message) : base(message)
    {
    }
}