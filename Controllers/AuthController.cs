using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PadelClub.Api.Data;
using PadelClub.Api.DTOs;
using PadelClub.Api.Models;
using PadelClub.Api.Services;

namespace PadelClub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwt;

        public AuthController(AppDbContext db, JwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        // POST: /api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Email duplicado
            if (await _db.Users.AnyAsync(u => u.Email == req.Email))
                return BadRequest("El email ya está registrado.");

            // Generar username si no vino
            string baseUsername = (req.Username ?? req.Email.Split('@')[0]).Trim().ToLower();
            string username = baseUsername;

            // Asegurar unicidad de username
            int i = 1;
            while (await _db.Users.AnyAsync(u => u.Username == username))
            {
                username = $"{baseUsername}{i}";
                i++;
            }

            // Obtener/crear rol "User"
            var roleUser = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (roleUser == null)
            {
                roleUser = new Role { Name = "User" };
                _db.Roles.Add(roleUser);
                await _db.SaveChangesAsync();
            }

            var user = new User
            {
                Username = username,
                Email = req.Email.Trim(),
                FullName = req.FullName.Trim(),
                RoleId = roleUser.Id,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Devolver token y user
            var token = _jwt.CreateToken(user.Id, user.Username, roleUser.Name);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.FullName,
                    role = roleUser.Name
                }
            });
        }

        // POST: /api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u =>
                    u.Username == req.UsernameOrEmail || u.Email == req.UsernameOrEmail);

            if (user == null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized("Credenciales inválidas.");

            var token = _jwt.CreateToken(user.Id, user.Username, user.Role?.Name ?? "User");

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.FullName,
                    role = user.Role?.Name ?? "User"
                }
            });
        }
    }
}
