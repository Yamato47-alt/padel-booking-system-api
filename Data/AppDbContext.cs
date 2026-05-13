
using Microsoft.EntityFrameworkCore;
using PadelClub.Api.Models;

namespace PadelClub.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Court> Courts => Set<Court>();
        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "User" }
            );

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Court>()
                .HasIndex(c => c.Name).IsUnique();

            modelBuilder.Entity<Booking>()
                .HasIndex(b => new { b.CourtId, b.StartTime, b.EndTime });

            base.OnModelCreating(modelBuilder);
        }
    }
}
