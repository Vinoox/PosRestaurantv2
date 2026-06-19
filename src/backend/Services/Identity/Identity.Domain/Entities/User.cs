using Identity.Domain.Exceptions;
using Microsoft.AspNetCore.Identity;
using PosRestaurant.Shared.Exceptions;
using System;

namespace Identity.Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string FirstName { get; private set; } = null!;
        public string LastName { get; private set; } = null!;
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }

        private User() { }

        public static User Create(string firstName, string lastName, string email)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new IdentityDomainException("Imię nie może być puste");

            if (string.IsNullOrWhiteSpace(lastName))
                throw new IdentityDomainException("Nazwisko nie może być puste");

            if (string.IsNullOrWhiteSpace(email))
                throw new IdentityDomainException("Email nie może być pusty");

            return new User
            {
                Id = Guid.NewGuid(),
                FirstName = NormalizeString(firstName),
                LastName = NormalizeString(lastName),
                Email = email.ToLower().Trim(),
                UserName = email.ToLower().Trim(),
                CreatedAt = DateTime.UtcNow
            };
        }

        public void UpdateFirstName(string newFirstName)
        {
            if (string.IsNullOrWhiteSpace(newFirstName))
                throw new IdentityDomainException("Imię nie może być puste");

            FirstName = NormalizeString(newFirstName);
        }

        public void UpdateLastName(string newLastName)
        {
            if (string.IsNullOrWhiteSpace(newLastName))
                throw new IdentityDomainException("Nazwisko nie może być puste");

            LastName = NormalizeString(newLastName);
        }

        private static string NormalizeString(string value)
        {
            var trimmed = value.Trim();
            if (trimmed.Length == 0) return string.Empty;
            if (trimmed.Length == 1) return trimmed.ToUpper();

            return char.ToUpper(trimmed[0]) + trimmed.Substring(1).ToLower();
        }
    }
}