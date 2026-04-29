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

            IQueryable<Servico> query = _context.Servicos.Include(s => s.Funeraria);
            if (funerariaId.HasValue) query = query.Where(s => s.FunerariaId == funerariaId.Value);

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
                .Include(s => s.Funeraria)
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
        public async Task<IActionResult> PutServico(int id, Servico servico)
        {
            var existing = await _context.Servicos.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            var isAdmin = User.IsAdmin();
            if (!isAdmin && existing.FunerariaId != User.GetUserId())
            {
                return Forbid();
            }

            existing.Nome = servico.Nome;
            existing.Descricao = servico.Descricao;
            existing.Preco = servico.Preco;

            // Somente admin pode transferir o servico para outra funeraria
            if (isAdmin && servico.FunerariaId > 0)
            {
                existing.FunerariaId = servico.FunerariaId;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServicoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Servicos - Admin ou funeraria (ela mesma)
        [HttpPost]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<ActionResult<ServicoDto>> PostServico(Servico servico)
        {
            if (!User.IsAdmin())
            {
                var uid = User.GetUserId();
                if (uid == null) return Forbid();
                servico.FunerariaId = uid.Value; // funeraria so cria em si mesma
            }
            else if (servico.FunerariaId <= 0 ||
                     !await _context.Funerarias.AnyAsync(f => f.Id == servico.FunerariaId))
            {
                return BadRequest(new { message = "FunerariaId invalido" });
            }

            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync();

            var created = await _context.Servicos
                .Include(s => s.Funeraria)
                .FirstOrDefaultAsync(s => s.Id == servico.Id);

            return CreatedAtAction("GetServico", new { id = servico.Id }, created!.ToDto());
        }

        // DELETE: api/Servicos/5 - Admin ou funeraria dona
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<IActionResult> DeleteServico(int id)
        {
            var servico = await _context.Servicos.FindAsync(id);
            if (servico == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && servico.FunerariaId != User.GetUserId())
            {
                return Forbid();
            }

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
