using Identity.Application.Users.Commands.ChangePassword;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, IdentityResult>
{
    private readonly UserManager<User> _userManager;

    public ChangePasswordCommandHandler(UserManager<User> userManager) => _userManager = userManager;

    public async Task<IdentityResult> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("Użytkownik", request.UserId);

        return await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
    }
}