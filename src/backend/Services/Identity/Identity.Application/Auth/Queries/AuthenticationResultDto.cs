using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Identity.Application.Auth.Queries
{
    public class AuthenticationResultDto
    {
        public string UserId { get; set; } = null!;
        public string AuthenticationToken { get; set; } = null!;
    }
}
