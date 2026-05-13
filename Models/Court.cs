
namespace PadelClub.Api.Models
{
    public class Court
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surface { get; set; } = "Sintético";
        public bool Indoor { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
