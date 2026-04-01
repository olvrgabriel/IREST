using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using IREST.API.Data;
using IREST.API.DTOs;
using IREST.API.Models;
using IREST.API.Extensions;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "funeraria")]
    public class MinhaFunerariaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MinhaFunerariaController(AppDbContext context)
        {
            _context = context;
        }

        private int GetFunerariaId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        // GET: api/MinhaFuneraria - Retorna dados da funeraria logada
        [HttpGet]
        public async Task<ActionResult<FunerariaDto>> GetMyFuneraria()
        {
            var id = GetFunerariaId();
            var funeraria = await _context.Funerarias
                .Include(f => f.Reviews).ThenInclude(r => r.Usuario)
                .Include(f => f.Servicos)
                .Include(f => f.Favoritos)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (funeraria == null) return NotFound();
            return funeraria.ToDto();
        }

        // PUT: api/MinhaFuneraria - Atualiza dados da funeraria logada
        [HttpPut]
        public async Task<IActionResult> UpdateMyFuneraria(Funeraria data)
        {
            var id = GetFunerariaId();
            var existing = await _context.Funerarias.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Nome = data.Nome;
            existing.Descricao = data.Descricao;
            existing.Cidade = data.Cidade;
            existing.Estado = data.Estado;
            existing.Latitude = data.Latitude;
            existing.Longitude = data.Longitude;
            existing.Telefone = data.Telefone;
            existing.Endereco = data.Endereco;
            existing.Horario = data.Horario;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/MinhaFuneraria/servicos - Lista servicos da funeraria logada
        [HttpGet("servicos")]
        public async Task<ActionResult<IEnumerable<ServicoDto>>> GetMyServicos()
        {
            var id = GetFunerariaId();
            var servicos = await _context.Servicos
                .Include(s => s.Funeraria)
                .Where(s => s.FunerariaId == id)
                .ToListAsync();

            return servicos.Select(s => s.ToDto()).ToList();
        }

        // POST: api/MinhaFuneraria/servicos - Cria servico para a funeraria logada
        [HttpPost("servicos")]
        public async Task<ActionResult<ServicoDto>> CreateServico(Servico servico)
        {
            var id = GetFunerariaId();
            servico.FunerariaId = id;

            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync();

            var created = await _context.Servicos
                .Include(s => s.Funeraria)
                .FirstOrDefaultAsync(s => s.Id == servico.Id);

            return CreatedAtAction(nameof(GetMyServicos), created!.ToDto());
        }

        // PUT: api/MinhaFuneraria/servicos/5 - Atualiza servico da funeraria logada
        [HttpPut("servicos/{servicoId}")]
        public async Task<IActionResult> UpdateServico(int servicoId, Servico data)
        {
            var funerariaId = GetFunerariaId();
            var existing = await _context.Servicos.FindAsync(servicoId);

            if (existing == null) return NotFound();
            if (existing.FunerariaId != funerariaId) return Forbid();

            existing.Nome = data.Nome;
            existing.Descricao = data.Descricao;
            existing.Preco = data.Preco;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/MinhaFuneraria/servicos/5 - Remove servico da funeraria logada
        [HttpDelete("servicos/{servicoId}")]
        public async Task<IActionResult> DeleteServico(int servicoId)
        {
            var funerariaId = GetFunerariaId();
            var servico = await _context.Servicos.FindAsync(servicoId);

            if (servico == null) return NotFound();
            if (servico.FunerariaId != funerariaId) return Forbid();

            _context.Servicos.Remove(servico);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/MinhaFuneraria/reviews - Lista avaliacoes da funeraria logada
        [HttpGet("reviews")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetMyReviews()
        {
            var id = GetFunerariaId();
            var reviews = await _context.Reviews
                .Include(r => r.Usuario)
                .Include(r => r.Funeraria)
                .Include(r => r.Admin)
                .Where(r => r.FunerariaId == id)
                .OrderByDescending(r => r.DataAvaliacao)
                .ToListAsync();

            return reviews.Select(r => r.ToDto()).ToList();
        }
    }
}
