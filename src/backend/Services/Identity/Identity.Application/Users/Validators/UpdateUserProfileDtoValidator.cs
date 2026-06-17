using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using Identity.Application.Users.Commands.UpdateUserProfile;

namespace Identity.Application.Users.Validators
{
    public class UpdateUserProfileDtoValidator: AbstractValidator<UpdateUserProfileCommand>
    {
        public UpdateUserProfileDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Imię nie może być puste.")
                .When(x => x.FirstName != null);

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Nazwisko nie może być puste.")
                .When(x => x.LastName != null);
        }
    }
}
