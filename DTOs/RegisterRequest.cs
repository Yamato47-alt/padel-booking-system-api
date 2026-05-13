using System.ComponentModel.DataAnnotations;

namespace PadelClub.Api.DTOs
{
    public class RegisterRequest
    {
        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        // Username opcional: si no viene, se genera desde el email
        public string? Username { get; set; }

        [Required, EmailAddress, StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(100, MinimumLength = 4)]
        public string Password { get; set; } = string.Empty;
    }
}
