
namespace PadelClub.Api.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int CourtId { get; set; }
        public Court? Court { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
