using System;

namespace PosRestaurant.Shared.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message)
        {
        }

        public NotFoundException(string name, object key)
            : base($"Zasób '{name}' o identyfikatorze ({key}) nie został znaleziony.")
        {
        }
    }
}