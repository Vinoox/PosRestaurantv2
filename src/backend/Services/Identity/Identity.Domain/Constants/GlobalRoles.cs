namespace Identity.Domain.Constants
{
    public static class GlobalRoles
    {
        public const string Admin = "Admin";
        public const string Premium = "Premium";
        public const string Default = "Default";
        public static string[] GetAll() => new[] { Admin, Premium, Default };
    }
}