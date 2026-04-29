using System.Security.Claims;

namespace IREST.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int? GetUserId(this ClaimsPrincipal user)
        {
            var raw = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(raw, out var id) ? id : null;
        }

        public static string? GetRole(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value;
        }

        public static bool IsAdmin(this ClaimsPrincipal user) =>
            user.GetRole() == "admin";

        public static bool IsUsuario(this ClaimsPrincipal user) =>
            user.GetRole() == "usuario";

        public static bool IsFuneraria(this ClaimsPrincipal user) =>
            user.GetRole() == "funeraria";
    }
}
