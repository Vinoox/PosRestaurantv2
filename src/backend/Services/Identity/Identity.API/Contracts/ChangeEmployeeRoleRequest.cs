using System;
namespace Identity.API.Contracts;

public record ChangeEmployeeRoleRequest(Guid NewRoleId);