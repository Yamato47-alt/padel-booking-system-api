
namespace PadelClub.Api.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // "Admin", "User"
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
