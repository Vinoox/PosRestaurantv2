using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using PosRestaurant.Shared.Exceptions;

namespace Identity.Application.Common.Extensions;

public static class UserManagerExtensions
{
    public static async Task<User> FindByEmailOrThrowAsync(this UserManager<User> userManager, string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            throw new NotFoundException("Użytkownik", email);
        return user;
    }
}