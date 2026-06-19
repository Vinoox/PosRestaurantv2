using System;
using System.Collections.Generic;
using Identity.Domain.Entities;

namespace Identity.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAuthenticationToken(User user, IEnumerable<string> roles, Guid? restaurantId = null, string? restaurantRole = null);
}