
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PadelClub.Api.Data;
using PadelClub.Api.Models;

namespace PadelClub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourtsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CourtsController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.Courts.Where(c => c.IsActive).OrderBy(c=>c.Name).ToListAsync();
            return Ok(list);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(Court court)
        {
            _db.Courts.Add(court);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = court.Id }, court);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, Court update)
        {
            var court = await _db.Courts.FindAsync(id);
            if (court == null) return NotFound();
            court.Name = update.Name;
            court.Surface = update.Surface;
            court.Indoor = update.Indoor;
            court.IsActive = update.IsActive;
            await _db.SaveChangesAsync();
            return Ok(court);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var court = await _db.Courts.FindAsync(id);
            if (court == null) return NotFound();
            _db.Courts.Remove(court);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
