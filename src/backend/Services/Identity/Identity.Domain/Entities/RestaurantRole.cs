using PosRestaurant.Shared.Entities;
using System;

namespace Identity.Domain.Entities
{
    public class RestaurantRole : BaseEntity
    {
        public string Name { get; private set; } = null!;
        public Guid RestaurantId { get; private set; }
        public bool IsSystemRole { get; private set; }
        public virtual Restaurant Restaurant { get; private set; } = null!;

        private RestaurantRole() { }

        public static RestaurantRole Create(string name, Guid restaurantId, bool isSystemRole = false)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Nazwa roli nie może być pusta.");

            if (restaurantId == Guid.Empty)
                throw new ArgumentException("Identyfikator restauracji nie może być pusty.");

            return new RestaurantRole
            {
                Name = name.Trim(),
                RestaurantId = restaurantId,
                IsSystemRole = isSystemRole
            };
        }
        public void UpdateName(string newName)
        {
            if (IsSystemRole)
                throw new InvalidOperationException("Nie można zmieniać nazwy systemowej roli.");

            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("Nowa nazwa nie może być pusta.");

            Name = newName.Trim();
        }
    }
}