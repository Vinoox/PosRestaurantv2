using System;
namespace Identity.API.Contracts;

public record AddEmployeeRequest(string EmployeeEmail, Guid RoleId);