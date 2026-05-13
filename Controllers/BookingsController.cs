using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PadelClub.Api.Data;
using PadelClub.Api.Models;

namespace PadelClub.Api.Controllers
{
    public class BookingCreateDto
    {
        public int CourtId { get; set; }
        public DateTime StartTime { get; set; }   // misma zona/UTC que uses en DB
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "Confirmed";
        public string? Notes { get; set; }

        // 👇 NUEVO: lo que el usuario escribe en el form
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public BookingsController(AppDbContext db) { _db = db; }

        // Obtiene el userId del token de forma robusta
        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var claim =
                User.FindFirst(ClaimTypes.NameIdentifier) ??
                User.FindFirst("nameidentifier") ??
                User.FindFirst("sub") ??
                User.FindFirst("id") ??
                User.FindFirst("uid");

            return claim != null && int.TryParse(claim.Value, out userId);
        }

        // ========== GET: /api/Bookings  (listado para Admin) ==========
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] DateTime? date)
        {
            var q = _db.Bookings
                       .AsNoTracking()
                       .Include(b => b.Court)
                       .Include(b => b.User)
                       .AsQueryable();

            if (date.HasValue)
            {
                var start = date.Value.Date;
                var end = start.AddDays(1);
                q = q.Where(b => b.StartTime >= start && b.StartTime < end);
            }

            var list = await q
                .OrderBy(b => b.StartTime)
                .Select(b => new
                {
                    b.Id,
                    // Si el nombre de la cancha contiene "Clase" => lo consideramos clase
                    Tipo = b.Court != null && b.Court.Name != null &&
                           b.Court.Name.Contains("Clase", StringComparison.OrdinalIgnoreCase)
                               ? "Clase"
                               : "Cancha",
                    b.CourtId,
                    Court = b.Court != null ? b.Court.Name : "-",
                    b.UserId,
                    // Priorizar FullName -> Username -> Email
                    Nombre = b.User != null
                        ? (b.User.FullName ?? b.User.Username ?? b.User.Email ?? "-")
                        : "-",
                    Telefono = b.User != null ? (b.User.Phone ?? "-") : "-",
                    b.StartTime,
                    b.EndTime,
                    b.Status,
                    b.Notes
                })
                .ToListAsync();

            return Ok(list);
        }

        // ========== POST: /api/Bookings ==========
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] BookingCreateDto data)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!TryGetUserId(out var userId))
                return Unauthorized("No se pudo determinar el usuario del token.");

            // 👇 ACTUALIZAMOS PERFIL si vinieron datos del form
            var user = await _db.Users.FindAsync(userId);
            if (user != null)
            {
                var name = (data.CustomerName ?? string.Empty).Trim();
                var phone = (data.CustomerPhone ?? string.Empty).Trim();

                bool changed = false;
                if (!string.IsNullOrWhiteSpace(name) &&
                    !string.Equals(user.FullName ?? string.Empty, name, StringComparison.Ordinal))
                {
                    user.FullName = name;
                    changed = true;
                }
                if (!string.IsNullOrWhiteSpace(phone) &&
                    !string.Equals(user.Phone ?? string.Empty, phone, StringComparison.Ordinal))
                {
                    user.Phone = phone;
                    changed = true;
                }
                if (changed)
                    await _db.SaveChangesAsync();
            }

            // Chequeo de superposición
            var overlap = await _db.Bookings.AnyAsync(b =>
                b.CourtId == data.CourtId &&
                b.Status != "Cancelled" &&
                b.StartTime < data.EndTime &&
                data.StartTime < b.EndTime
            );
            if (overlap)
                return Conflict("Existe una reserva superpuesta para esa cancha y horario.");

            var entity = new Booking
            {
                CourtId = data.CourtId,
                StartTime = data.StartTime,
                EndTime = data.EndTime,
                Status = string.IsNullOrWhiteSpace(data.Status) ? "Confirmed" : data.Status,
                Notes = data.Notes ?? "",
                UserId = userId
            };

            _db.Bookings.Add(entity);
            await _db.SaveChangesAsync();

            var created = await _db.Bookings
                                   .AsNoTracking()
                                   .Include(b => b.Court)
                                   .Include(b => b.User)
                                   .FirstAsync(b => b.Id == entity.Id);

            var dto = new
            {
                created.Id,
                created.CourtId,
                Court = created.Court?.Name,
                created.UserId,
                Nombre = created.User?.FullName ?? created.User?.Username ?? created.User?.Email ?? "-",
                Telefono = created.User?.Phone ?? "-",
                created.StartTime,
                created.EndTime,
                created.Status,
                created.Notes
            };

            // No tenés GET by id, así que devolvemos Created con la URL del recurso
            return Created($"/api/Bookings/{created.Id}", dto);
        }

        // ========== GET: /api/Bookings/mine (mis reservas) ==========
        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> Mine()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized("No se pudo determinar el usuario del token.");

            var list = await _db.Bookings
                .AsNoTracking()
                .Include(b => b.Court)
                .Include(b => b.User)
                .Where(b => b.UserId == userId)
                .OrderBy(b => b.StartTime)
                .Select(b => new
                {
                    b.Id,
                    b.CourtId,
                    Court = b.Court != null ? b.Court.Name : "-",
                    b.UserId,
                    Nombre = b.User != null
                        ? (b.User.FullName ?? b.User.Username ?? b.User.Email ?? "-")
                        : "-",
                    Telefono = b.User != null ? (b.User.Phone ?? "-") : "-",
                    b.StartTime,
                    b.EndTime,
                    b.Status,
                    b.Notes
                })
                .ToListAsync();

            return Ok(list);
        }

        // ========== DELETE: /api/Bookings/{id} ==========
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var b = await _db.Bookings.FindAsync(id);
            if (b == null) return NotFound();

            _db.Bookings.Remove(b);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
