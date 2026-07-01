using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IREST.API.Data;
using IREST.API.Models;
using IREST.API.DTOs;
using IREST.API.Extensions;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServicosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Servicos - Publico
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServicoDto>>> GetServicos(int page = 1, int pageSize = 100, int? funerariaId = null)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 500 ? 100 : pageSize;

            IQueryable<Servico> query = _context.Servicos
                .Include(s => s.FunerariaServicos!).ThenInclude(fs => fs.Funeraria);
            if (funerariaId.HasValue)
                query = query.Where(s => s.FunerariaServicos!.Any(fs => fs.FunerariaId == funerariaId.Value));

            var servicos = await query
                .OrderBy(s => s.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return servicos.Select(s => s.ToDto()!).ToList();
        }

        // GET: api/Servicos/5 - Publico
        [HttpGet("{id}")]
        public async Task<ActionResult<ServicoDto>> GetServico(int id)
        {
            var servico = await _context.Servicos
                .Include(s => s.FunerariaServicos!).ThenInclude(fs => fs.Funeraria)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (servico == null)
            {
                return NotFound();
            }

            return servico.ToDto()!;
        }

        // PUT: api/Servicos/5 - Admin ou funeraria dona do servico
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<IActionResult> PutServico(int id, ServicoRequest req)
        {
            var existing = await _context.Servicos
                .Include(s => s.FunerariaServicos!)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (existing == null)
            {
                return NotFound();
            }

            var isAdmin = User.IsAdmin();
            if (!isAdmin && !existing.FunerariaServicos!.Any(fs => fs.FunerariaId == User.GetUserId()))
            {
                return Forbid();
            }

            existing.Nome = req.Nome;
            existing.Descricao = req.Descricao;
            existing.Preco = req.Preco;

            // Somente admin pode transferir o servico para outra funeraria
            if (isAdmin && req.FunerariaId > 0 &&
                await _context.Funerarias.AnyAsync(f => f.Id == req.FunerariaId))
            {
                _context.FunerariaServicos.RemoveRange(existing.FunerariaServicos!);
                _context.FunerariaServicos.Add(new FunerariaServico { FunerariaId = req.FunerariaId, ServicoId = existing.Id });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/Servicos - Admin ou funeraria (ela mesma)
        [HttpPost]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<ActionResult<ServicoDto>> PostServico(ServicoRequest req)
        {
            int funerariaId;
            if (!User.IsAdmin())
            {
                var uid = User.GetUserId();
                if (uid == null) return Forbid();
                funerariaId = uid.Value; // funeraria so cria em si mesma
            }
            else if (req.FunerariaId <= 0 ||
                     !await _context.Funerarias.AnyAsync(f => f.Id == req.FunerariaId))
            {
                return BadRequest(new { message = "FunerariaId invalido" });
            }
            else
            {
                funerariaId = req.FunerariaId;
            }

            var servico = new Servico { Nome = req.Nome, Descricao = req.Descricao, Preco = req.Preco };
            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync();

            _context.FunerariaServicos.Add(new FunerariaServico { FunerariaId = funerariaId, ServicoId = servico.Id });
            await _context.SaveChangesAsync();

            var funeraria = await _context.Funerarias.FindAsync(funerariaId);
            return CreatedAtAction("GetServico", new { id = servico.Id }, servico.ToDto(funerariaId, funeraria?.Nome));
        }

        // DELETE: api/Servicos/5 - Admin ou funeraria dona
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<IActionResult> DeleteServico(int id)
        {
            var servico = await _context.Servicos
                .Include(s => s.FunerariaServicos!)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (servico == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && !servico.FunerariaServicos!.Any(fs => fs.FunerariaId == User.GetUserId()))
            {
                return Forbid();
            }

            // Remove os vinculos e o servico do catalogo.
            _context.FunerariaServicos.RemoveRange(servico.FunerariaServicos!);
            _context.Servicos.Remove(servico);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ServicoExists(int id)
        {
            return _context.Servicos.Any(e => e.Id == id);
        }
    }
}
