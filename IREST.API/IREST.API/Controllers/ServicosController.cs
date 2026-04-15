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
        public async Task<ActionResult<IEnumerable<ServicoDto>>> GetServicos()
        {
            var servicos = await _context.Servicos
                .Include(s => s.Funeraria)
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

        // PUT: api/Servicos/5 - Admin ou funeraria
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<IActionResult> PutServico(int id, Servico servico)
        {
            var existing = await _context.Servicos.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Nome = servico.Nome;
            existing.Descricao = servico.Descricao;
            existing.Preco = servico.Preco;
            existing.FunerariaId = servico.FunerariaId;

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

        // POST: api/Servicos - Admin ou funeraria
        [HttpPost]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<ActionResult<ServicoDto>> PostServico(Servico servico)
        {
            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync();

            var created = await _context.Servicos
                .Include(s => s.Funeraria)
                .FirstOrDefaultAsync(s => s.Id == servico.Id);

            return CreatedAtAction("GetServico", new { id = servico.Id }, created!.ToDto());
        }

        // DELETE: api/Servicos/5 - Admin ou funeraria
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,funeraria")]
        public async Task<IActionResult> DeleteServico(int id)
        {
            var servico = await _context.Servicos.FindAsync(id);
            if (servico == null)
            {
                return NotFound();
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
