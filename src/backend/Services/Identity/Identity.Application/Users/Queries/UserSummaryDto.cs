using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Identity.Domain.Entities;
using PosRestaurant.Shared.Mappings;

namespace Identity.Application.Users.Dtos.Queries
{
    public class UserSummaryDto : IMap
    {
        public required string Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<User, UserSummaryDto>();
        }
    }
}
