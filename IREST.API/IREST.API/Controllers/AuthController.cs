using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IREST.API.Data;
using IREST.API.DTOs;
using IREST.API.Models;
using IREST.API.Services;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly GeocodingService _geocoding;

        public AuthController(AppDbContext context, IConfiguration configuration, GeocodingService geocoding)
        {
            _context = context;
            _configuration = configuration;
            _geocoding = geocoding;
        }

        // POST: api/Auth/register - Cadastro de usuario comum
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Nome) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Senha))
            {
                return BadRequest(new { message = "Preencha todos os campos" });
            }

            // Verifica se email ja existe em qualquer tabela
            if (await EmailExists(request.Email))
            {
                return BadRequest(new { message = "Email ja cadastrado" });
            }

            var usuario = new Usuario
            {
                Nome = request.Nome,
                Email = request.Email,
                Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                DataCadastro = DateTime.Now
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = GenerateToken(usuario.Id, usuario.Nome, usuario.Email, "usuario");

            return Ok(new AuthResponse
            {
                Token = token,
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Role = "usuario"
            });
        }

        // POST: api/Auth/register-funeraria - Cadastro de funeraria
        [HttpPost("register-funeraria")]
        public async Task<ActionResult<AuthResponse>> RegisterFuneraria(RegisterFunerariaRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Nome) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Senha) ||
                string.IsNullOrWhiteSpace(request.Cidade))
            {
                return BadRequest(new { message = "Preencha todos os campos obrigatorios" });
            }

            if (await EmailExists(request.Email))
            {
                return BadRequest(new { message = "Email ja cadastrado" });
            }

            var funeraria = new Funeraria
            {
                Nome = request.Nome,
                Email = request.Email,
                Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                Cidade = request.Cidade,
                Estado = request.Estado,
                Telefone = request.Telefone,
                Endereco = request.Endereco
            };

            // Geocodifica endereço automaticamente
            var coords = await _geocoding.GeocodeAsync(request.Endereco, request.Cidade, request.Estado);
            if (coords != null)
            {
                funeraria.Latitude = coords.Latitude;
                funeraria.Longitude = coords.Longitude;
            }

            _context.Funerarias.Add(funeraria);
            await _context.SaveChangesAsync();

            var token = GenerateToken(funeraria.Id, funeraria.Nome, funeraria.Email, "funeraria");

            return Ok(new AuthResponse
            {
                Token = token,
                Id = funeraria.Id,
                Nome = funeraria.Nome,
                Email = funeraria.Email,
                Role = "funeraria"
            });
        }

        // POST: api/Auth/login - Login unificado (admin, funeraria ou usuario)
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
            {
                return BadRequest(new { message = "Preencha email e senha" });
            }

            // 1. Tenta como admin
            var admin = await _context.Admins
                .FirstOrDefaultAsync(a => a.Email == request.Email);

            if (admin != null && !string.IsNullOrEmpty(admin.Senha) &&
                BCrypt.Net.BCrypt.Verify(request.Senha, admin.Senha))
            {
                var token = GenerateToken(admin.Id, admin.Nome, admin.Email, "admin");
                return Ok(new AuthResponse
                {
                    Token = token,
                    Id = admin.Id,
                    Nome = admin.Nome,
                    Email = admin.Email,
                    Role = "admin"
                });
            }

            // 2. Tenta como funeraria
            var funeraria = await _context.Funerarias
                .FirstOrDefaultAsync(f => f.Email == request.Email);

            if (funeraria != null && !string.IsNullOrEmpty(funeraria.Senha) &&
                BCrypt.Net.BCrypt.Verify(request.Senha, funeraria.Senha))
            {
                var token = GenerateToken(funeraria.Id, funeraria.Nome, funeraria.Email!, "funeraria");
                return Ok(new AuthResponse
                {
                    Token = token,
                    Id = funeraria.Id,
                    Nome = funeraria.Nome,
                    Email = funeraria.Email!,
                    Role = "funeraria"
                });
            }

            // 3. Tenta como usuario
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (usuario != null && !string.IsNullOrEmpty(usuario.Senha) &&
                BCrypt.Net.BCrypt.Verify(request.Senha, usuario.Senha))
            {
                var token = GenerateToken(usuario.Id, usuario.Nome, usuario.Email, "usuario");
                return Ok(new AuthResponse
                {
                    Token = token,
                    Id = usuario.Id,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                    Role = "usuario"
                });
            }

            return Unauthorized(new { message = "Email ou senha invalidos" });
        }

        private async Task<bool> EmailExists(string email)
        {
            var existsUsuario = await _context.Usuarios.AnyAsync(u => u.Email == email);
            var existsAdmin = await _context.Admins.AnyAsync(a => a.Email == email);
            var existsFuneraria = await _context.Funerarias.AnyAsync(f => f.Email == email);
            return existsUsuario || existsAdmin || existsFuneraria;
        }

        private string GenerateToken(int id, string nome, string email, string role)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                new Claim(ClaimTypes.Name, nome),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };

            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "1440");

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
