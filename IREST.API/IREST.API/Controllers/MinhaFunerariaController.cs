using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using IREST.API.Data;
using IREST.API.DTOs;
using IREST.API.Models;
using IREST.API.Extensions;
using IREST.API.Services;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "funeraria")]
    public class MinhaFunerariaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GeocodingService _geocoding;

        public MinhaFunerariaController(AppDbContext context, GeocodingService geocoding)
        {
            _context = context;
            _geocoding = geocoding;
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
                .Include(f => f.Reviews!).ThenInclude(r => r.Usuario)
                .Include(f => f.FunerariaServicos!).ThenInclude(fs => fs.Servico)
                .Include(f => f.Favoritos!)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (funeraria == null) return NotFound();
            return funeraria.ToDto()!;
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
            existing.Telefone = data.Telefone;
            existing.Endereco = data.Endereco;
            existing.Horario = data.Horario;

            // Se lat/lng foram informados, usa direto; senão geocodifica
            if (data.Latitude.HasValue && data.Longitude.HasValue)
            {
                existing.Latitude = data.Latitude;
                existing.Longitude = data.Longitude;
            }
            else
            {
                var coords = await _geocoding.GeocodeAsync(data.Endereco, data.Cidade, data.Estado);
                if (coords != null)
                {
                    existing.Latitude = coords.Latitude;
                    existing.Longitude = coords.Longitude;
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/MinhaFuneraria/servicos - Lista servicos da funeraria logada
        [HttpGet("servicos")]
        public async Task<ActionResult<IEnumerable<ServicoDto>>> GetMyServicos()
        {
            var id = GetFunerariaId();
            var funeraria = await _context.Funerarias.FindAsync(id);

            var servicos = await _context.FunerariaServicos
                .Where(fs => fs.FunerariaId == id)
                .Include(fs => fs.Servico)
                .Select(fs => fs.Servico!)
                .ToListAsync();

            return servicos.Select(s => s.ToDto(id, funeraria?.Nome)).ToList();
        }

        // POST: api/MinhaFuneraria/servicos - Cria servico para a funeraria logada
        [HttpPost("servicos")]
        public async Task<ActionResult<ServicoDto>> CreateServico(ServicoRequest data)
        {
            var id = GetFunerariaId();
            var funeraria = await _context.Funerarias.FindAsync(id);
            if (funeraria == null) return NotFound();

            var servico = new Servico { Nome = data.Nome, Descricao = data.Descricao, Preco = data.Preco };
            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync();

            _context.FunerariaServicos.Add(new FunerariaServico { FunerariaId = id, ServicoId = servico.Id });
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyServicos), servico.ToDto(id, funeraria.Nome));
        }

        // PUT: api/MinhaFuneraria/servicos/5 - Atualiza servico da funeraria logada
        [HttpPut("servicos/{servicoId}")]
        public async Task<IActionResult> UpdateServico(int servicoId, ServicoRequest data)
        {
            var funerariaId = GetFunerariaId();
            var vinculado = await _context.FunerariaServicos
                .AnyAsync(fs => fs.ServicoId == servicoId && fs.FunerariaId == funerariaId);
            if (!vinculado) return Forbid();

            var existing = await _context.Servicos.FindAsync(servicoId);
            if (existing == null) return NotFound();

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
            var vinculo = await _context.FunerariaServicos
                .FirstOrDefaultAsync(fs => fs.ServicoId == servicoId && fs.FunerariaId == funerariaId);
            if (vinculo == null) return NotFound();

            _context.FunerariaServicos.Remove(vinculo);
            await _context.SaveChangesAsync();

            // Remove o servico do catalogo se nenhuma outra funeraria o oferece.
            var aindaOferecido = await _context.FunerariaServicos.AnyAsync(fs => fs.ServicoId == servicoId);
            if (!aindaOferecido)
            {
                var servico = await _context.Servicos.FindAsync(servicoId);
                if (servico != null)
                {
                    _context.Servicos.Remove(servico);
                    await _context.SaveChangesAsync();
                }
            }

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

            return reviews.Select(r => r.ToDto()!).ToList();
        }
    }
}
