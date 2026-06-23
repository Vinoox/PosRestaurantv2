using FluentValidation;

namespace Identity.Application.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandValidator : AbstractValidator<GoogleLoginCommand>
{
    public GoogleLoginCommandValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty().WithMessage("Token Google jest wymagany do zalogowania.");
    }
}