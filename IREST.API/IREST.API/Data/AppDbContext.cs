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
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Coordenadas precisam de casas decimais suficientes para o mapa
            // (decimal(9,6) ~= 0,11 m de precisao). Sem isso, o EF usa (18,2)
            // e trunca a lat/long, deixando os pinos imprecisos.
            modelBuilder.Entity<Funeraria>().Property(f => f.Latitude).HasPrecision(9, 6);
            modelBuilder.Entity<Funeraria>().Property(f => f.Longitude).HasPrecision(9, 6);

            // Preco monetario: precisao explicita para evitar truncamento silencioso.
            modelBuilder.Entity<Servico>().Property(s => s.Preco).HasPrecision(18, 2);
        }
    }
}
