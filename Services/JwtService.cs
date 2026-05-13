using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PadelClub.Api.Services
{
    // =====================================
    // 🔐 Opciones de configuración del JWT
    // =====================================
    public class JwtOptions
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpiresMinutes { get; set; } = 240;
    }

    // =====================================
    // 🔑 Servicio para generar el token JWT
    // =====================================
    public class JwtService
    {
        private readonly JwtOptions _options;
        private readonly byte[] _key;

        public JwtService(IOptions<JwtOptions> options)
        {
            _options = options.Value;
            _key = Encoding.UTF8.GetBytes(_options.Key);
        }

        public string CreateToken(int userId, string username, string? role)
        {
            // Si el rol no viene, por defecto es "User"
            var userRole = string.IsNullOrWhiteSpace(role) ? "User" : role;

            // Lista de claims (identidad del usuario)
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),              // ID del usuario
                new Claim(JwtRegisteredClaimNames.UniqueName, username),               // nombre de usuario
                new Claim(ClaimTypes.Role, userRole),                                  // rol ("Admin" o "User")
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),      // ID único del token
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()) // fecha emisión
            };

            // Firmar el token
            var creds = new SigningCredentials(new SymmetricSecurityKey(_key), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_options.ExpiresMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
