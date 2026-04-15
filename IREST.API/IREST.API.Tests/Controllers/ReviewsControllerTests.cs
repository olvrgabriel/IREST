using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Xunit;

namespace IREST.API.Tests.Controllers
{
    public class ReviewsControllerTests : IClassFixture<IrestWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly IrestWebApplicationFactory _factory;

        public ReviewsControllerTests(IrestWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        // ===== GET (PUBLICO) =====

        [Fact]
        public async Task GetReviews_SemAutenticacao_RetornaOk()
        {
            var response = await _client.GetAsync("/api/reviews");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetReview_IdInexistente_RetornaNotFound()
        {
            var response = await _client.GetAsync("/api/reviews/99999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        // ===== POST (REQUER ROLE USUARIO) =====

        [Fact]
        public async Task PostReview_SemAutenticacao_RetornaUnauthorized()
        {
            var review = new
            {
                nota = 5,
                comentario = "Otimo servico",
                usuarioId = 1,
                funerariaId = 1
            };

            var response = await _client.PostAsJsonAsync("/api/reviews", review);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task PostReview_ComTokenFuneraria_RetornaForbidden()
        {
            var token = await ObterTokenFuneraria();

            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/reviews");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(new
            {
                nota = 4,
                comentario = "Bom servico",
                usuarioId = 1,
                funerariaId = 1
            });

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        // ===== PUT (REQUER ADMIN) =====

        [Fact]
        public async Task PutReview_SemAutenticacao_RetornaUnauthorized()
        {
            using var request = new HttpRequestMessage(HttpMethod.Put, "/api/reviews/1");
            request.Content = JsonContent.Create(new { nota = 3, comentario = "Editado" });

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task PutReview_ComTokenUsuario_RetornaForbidden()
        {
            var token = await ObterTokenUsuario();

            using var request = new HttpRequestMessage(HttpMethod.Put, "/api/reviews/1");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(new { nota = 3, comentario = "Tentativa" });

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        // ===== DELETE (REQUER ADMIN OU USUARIO) =====

        [Fact]
        public async Task DeleteReview_SemAutenticacao_RetornaUnauthorized()
        {
            var response = await _client.DeleteAsync("/api/reviews/1");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task DeleteReview_ComTokenUsuario_ReviewInexistente_RetornaNotFound()
        {
            var token = await ObterTokenUsuario();

            using var request = new HttpRequestMessage(HttpMethod.Delete, "/api/reviews/99999");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.SendAsync(request);
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

        private async Task<string> ObterTokenFuneraria()
        {
            var email = $"fun_{Guid.NewGuid()}@test.com";
            var resp = await _client.PostAsJsonAsync("/api/auth/register-funeraria", new
            {
                nome = "Funeraria Test",
                email,
                senha = "senha123",
                cidade = "Sao Paulo"
            });
            var body = await resp.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            return body!["token"]!.ToString()!;
        }
    }
}
