using System;
using Identity.Domain.Exceptions;
using PosRestaurant.Shared.Entities;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Domain.Entities
{
    public class Restaurant : BaseAuditableEntity
    {
        public string Name { get; private set; } = null!;
        public string? Address { get; private set; }
        public string? TaxId { get; private set; }
        public bool IsActive { get; private set; }

        private Restaurant() { }
        public static Restaurant Create(string name, string? address = null, string? taxId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new IdentityDomainException("Nazwa restauracji nie może być pusta.");

            return new Restaurant
            {
                Name = name.Trim(),
                Address = address?.Trim(),
                TaxId = taxId?.Trim(),
                IsActive = true
            };
        }

        public void UpdateDetails(string name, string? address, string? taxId)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new IdentityDomainException("Nazwa restauracji nie może być pusta.");

            Name = name.Trim();
            Address = address?.Trim();
            TaxId = taxId?.Trim();
        }

        public void Deactivate()
        {
            IsActive = false;
        }

        public void Activate()
        {
            IsActive = true;
        }
    }
}