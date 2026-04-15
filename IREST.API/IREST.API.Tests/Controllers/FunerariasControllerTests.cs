using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace IREST.API.Tests.Controllers
{
    public class FunerariasControllerTests : IClassFixture<IrestWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly IrestWebApplicationFactory _factory;

        public FunerariasControllerTests(IrestWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        // ===== GET (PUBLICO) =====

        [Fact]
        public async Task GetFunerarias_SemAutenticacao_RetornaOk()
        {
            var response = await _client.GetAsync("/api/funerarias");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetFunerarias_RetornaListaJson()
        {
            var response = await _client.GetAsync("/api/funerarias");
            var body = await response.Content.ReadFromJsonAsync<List<object>>();
            Assert.NotNull(body);
        }

        // ===== POST (REQUER ADMIN) =====

        [Fact]
        public async Task PostFuneraria_SemAutenticacao_RetornaUnauthorized()
        {
            var funeraria = new
            {
                nome = "Funeraria Nova",
                cidade = "Campinas",
                estado = "SP"
            };

            var response = await _client.PostAsJsonAsync("/api/funerarias", funeraria);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task PostFuneraria_ComTokenUsuario_RetornaForbidden()
        {
            var token = await ObterTokenUsuario();

            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/funerarias");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(new { nome = "Funeraria Teste", cidade = "SP", estado = "SP" });

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task PostFuneraria_ComTokenAdmin_RetornaCreated()
        {
            var token = await ObterTokenAdmin();

            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/funerarias");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(new
            {
                nome = "Funeraria Criada pelo Admin",
                cidade = "Belo Horizonte",
                estado = "MG"
            });

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        // ===== DELETE (REQUER ADMIN) =====

        [Fact]
        public async Task DeleteFuneraria_SemAutenticacao_RetornaUnauthorized()
        {
            var response = await _client.DeleteAsync("/api/funerarias/999");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task DeleteFuneraria_ComTokenAdmin_FunerariaInexistente_RetornaNotFound()
        {
            var token = await ObterTokenAdmin();

            using var request = new HttpRequestMessage(HttpMethod.Delete, "/api/funerarias/99999");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetFuneraria_PorId_Inexistente_RetornaNotFound()
        {
            var response = await _client.GetAsync("/api/funerarias/99999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        // ===== HELPERS =====

        private async Task<string> ObterTokenUsuario()
        {
            var email = $"usr_{Guid.NewGuid()}@test.com";
            var resp = await _client.PostAsJsonAsync("/api/auth/register", new
            {
                nome = "Usuario Test",
                email,
                senha = "senha123"
            });
            var body = await resp.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            return body!["token"]!.ToString()!;
        }

        private async Task<string> ObterTokenAdmin()
        {
            var email = $"adm_{Guid.NewGuid()}@test.com";
            var senha = "admin123";

            // Cria admin diretamente no banco
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IREST.API.Data.AppDbContext>();

            var admin = new IREST.API.Models.Admin
            {
                Nome = "Admin Teste",
                Email = email,
                Senha = BCrypt.Net.BCrypt.HashPassword(senha)
            };
            context.Admins.Add(admin);
            await context.SaveChangesAsync();

            // Faz login como admin
            var resp = await _client.PostAsJsonAsync("/api/auth/login", new { email, senha });
            Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

            var body = await resp.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            Assert.NotNull(body);
            Assert.True(body!.ContainsKey("token"), "Resposta de login deve conter 'token'");
            return body["token"]!.ToString()!;
        }
    }
}
