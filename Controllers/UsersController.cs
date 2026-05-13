
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PadelClub.Api.Data;

namespace PadelClub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public UsersController(AppDbContext db) { _db = db; }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _db.Users.Include(u => u.Role).ToListAsync();
            return Ok(users.Select(u => new {
                u.Id, u.Username, u.Email, u.FullName, u.IsActive, Role = u.Role!.Name, u.CreatedAt
            }));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var sub = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            if (sub == null) return Unauthorized();
            var id = int.Parse(sub);
            var u = await _db.Users.Include(x=>x.Role).FirstAsync(x => x.Id == id);
            return Ok(new { u.Id, u.Username, u.Email, u.FullName, Role = u.Role!.Name });
        }
    }
}
