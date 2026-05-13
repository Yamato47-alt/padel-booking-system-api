namespace PadelClub.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // 🔹 Lo dejamos nullable para evitar errores si el usuario no completa el nombre
        public string? FullName { get; set; }

        // 🔹 Nuevo campo — ahora el admin podrá ver el teléfono del usuario
        public string? Phone { get; set; }

        public string PasswordHash { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int RoleId { get; set; }
        public Role? Role { get; set; }

        // 🔹 Relación con las reservas
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
