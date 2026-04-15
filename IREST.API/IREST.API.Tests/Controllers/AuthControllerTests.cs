using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace IREST.API.Tests.Controllers
{
    public class AuthControllerTests : IClassFixture<IrestWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public AuthControllerTests(IrestWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        // ===== REGISTER =====

        [Fact]
        public async Task Register_ComDadosValidos_RetornaOkComToken()
        {
            var request = new
            {
                nome = "Joao Teste",
                email = $"joao_{Guid.NewGuid()}@teste.com",
                senha = "senha123"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", request);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            Assert.NotNull(body);
            Assert.True(body!.ContainsKey("token"));
            Assert.Equal("usuario", body["role"]?.ToString());
        }

        [Fact]
        public async Task Register_SemNome_RetornaBadRequest()
        {
            var request = new
            {
                nome = "",
                email = "teste@teste.com",
                senha = "senha123"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Register_EmailDuplicado_RetornaBadRequest()
        {
            var email = $"dup_{Guid.NewGuid()}@teste.com";

            // Primeiro registro deve ter sucesso
            var primeiroResponse = await _client.PostAsJsonAsync("/api/auth/register",
                new { nome = "Usuario1", email, senha = "senha123" });
            Assert.Equal(HttpStatusCode.OK, primeiroResponse.StatusCode);

            // Segundo registro com mesmo email deve falhar
            var response = await _client.PostAsJsonAsync("/api/auth/register",
                new { nome = "Usuario2", email, senha = "senha456" });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        // ===== REGISTER FUNERARIA =====

        [Fact]
        public async Task RegisterFuneraria_ComDadosValidos_RetornaOkComRoleFuneraria()
        {
            var request = new
            {
                nome = "Funeraria Teste",
                email = $"funeraria_{Guid.NewGuid()}@teste.com",
                senha = "senha123",
                cidade = "Sao Paulo",
                estado = "SP"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register-funeraria", request);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            Assert.NotNull(body);
            Assert.Equal("funeraria", body!["role"]?.ToString());
        }

        [Fact]
        public async Task RegisterFuneraria_SemCidade_RetornaBadRequest()
        {
            var request = new
            {
                nome = "Funeraria Teste",
                email = $"funeraria_{Guid.NewGuid()}@teste.com",
                senha = "senha123",
                cidade = ""
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register-funeraria", request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        // ===== LOGIN =====

        [Fact]
        public async Task Login_ComCredenciaisValidas_RetornaOkComToken()
        {
            var email = $"login_{Guid.NewGuid()}@teste.com";
            var senha = "minhasenha";

            // Registra usuario
            var registerResp = await _client.PostAsJsonAsync("/api/auth/register", new
            {
                nome = "Usuario Login",
                email,
                senha
            });
            Assert.Equal(HttpStatusCode.OK, registerResp.StatusCode);

            // Faz login
            var response = await _client.PostAsJsonAsync("/api/auth/login", new { email, senha });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            Assert.NotNull(body);
            Assert.True(body!.ContainsKey("token"));
        }

        [Fact]
        public async Task Login_ComSenhaErrada_RetornaUnauthorized()
        {
            var email = $"wrongpw_{Guid.NewGuid()}@teste.com";

            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                nome = "Usuario",
                email,
                senha = "senhaCorreta"
            });

            var response = await _client.PostAsJsonAsync("/api/auth/login", new
            {
                email,
                senha = "senhaErrada"
            });

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_ComEmailInexistente_RetornaUnauthorized()
        {
            var response = await _client.PostAsJsonAsync("/api/auth/login", new
            {
                email = $"naoexiste_{Guid.NewGuid()}@teste.com",
                senha = "qualquercoisa"
            });

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_SemEmail_RetornaBadRequest()
        {
            var response = await _client.PostAsJsonAsync("/api/auth/login", new
            {
                email = "",
                senha = "senha123"
            });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Login_Funeraria_RetornaRoleCorreta()
        {
            var email = $"fun_login_{Guid.NewGuid()}@teste.com";
            var senha = "senha123";

            await _client.PostAsJsonAsync("/api/auth/register-funeraria", new
            {
                nome = "Funeraria Login",
                email,
                senha,
                cidade = "Belo Horizonte"
            });

            var response = await _client.PostAsJsonAsync("/api/auth/login", new { email, senha });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            Assert.Equal("funeraria", body!["role"]?.ToString());
        }
    }
}
