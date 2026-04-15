using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using IREST.API.Data;

namespace IREST.API.Tests
{
    /// <summary>
    /// Factory que substitui SQL Server por InMemory para testes de integracao.
    /// </summary>
    public class IrestWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _databaseName = "IrestTestDb_" + Guid.NewGuid();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            var dbName = _databaseName;

            builder.ConfigureServices(services =>
            {
                // Remove o DbContext real (SQL Server)
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Adiciona InMemory Database (nome fixo por instancia da factory)
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(dbName);
                });
            });

            // Configura variaveis JWT para os testes
            builder.UseSetting("Jwt:Key", "chave-secreta-super-longa-para-testes-irest-2024");
            builder.UseSetting("Jwt:Issuer", "IrestAPI");
            builder.UseSetting("Jwt:Audience", "IrestApp");
            builder.UseSetting("Jwt:ExpireMinutes", "60");
        }
    }
}
