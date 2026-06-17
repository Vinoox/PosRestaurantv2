using Microsoft.AspNetCore.Identity;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string FirstName { get; private set; } = null!;
        public string LastName { get; private set; } = null!;
        public string PinHash { get; private set; } = null!;

        private User() { }

        public static User Create(string firstName, string lastName, string email)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new DomainException("Imię nie może być puste");

            if (string.IsNullOrWhiteSpace(lastName))
                throw new DomainException("Nazwisko nie może być puste");

            if (string.IsNullOrWhiteSpace(email))
                throw new DomainException("Email nie może być pusty");

            return new User
            {
                FirstName = NormalizeString(firstName),
                LastName = NormalizeString(lastName),
                Email = email.ToLower().Trim(),
                UserName = email.ToLower().Trim()
            };
        }

        public void UpdateFirstName(string newFirstName)
        {
            if (string.IsNullOrWhiteSpace(newFirstName))
                throw new DomainException("Imię nie może być puste");

            FirstName = NormalizeString(newFirstName);
        }

        public void UpdateLastName(string newLastName)
        {
            if (string.IsNullOrWhiteSpace(newLastName))
                throw new DomainException("Nazwisko nie może być puste");

            LastName = NormalizeString(newLastName);
        }

        public void SetPinHash(string newPinHash)
        {
            if (string.IsNullOrWhiteSpace(newPinHash))
                throw new DomainException("PIN nie może być pusty");

            PinHash = newPinHash;
        }

        private static string NormalizeString(string value)
        {
            var trimmed = value.Trim();
            if (trimmed.Length == 0) return string.Empty;
            if (trimmed.Length == 1) return trimmed.ToUpper();
            return char.ToUpper(value[0]) + value.Substring(1).ToLower();
        }
    }
}