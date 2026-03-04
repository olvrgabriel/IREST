using IREST.API.Models;
using Microsoft.EntityFrameworkCore;
namespace IREST.API.Data
{

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Funeraria> Funerarias { get; set; }
        public DbSet<Servico> Servicos { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Favorito> Favoritos { get; set; }
        public DbSet<ChatbotSession> ChatbotSessions { get; set; }
        public DbSet<ChatbotMessage> ChatbotMessages { get; set; }
    }
}
