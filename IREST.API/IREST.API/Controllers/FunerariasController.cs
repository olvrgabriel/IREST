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
using IREST.API.Services;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FunerariasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GeocodingService _geocoding;

        public FunerariasController(AppDbContext context, GeocodingService geocoding)
        {
            _context = context;
            _geocoding = geocoding;
        }

        // GET: api/Funerarias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FunerariaDto>>> GetFunerarias()
        {
            var funerarias = await _context.Funerarias
                .Include(f => f.Reviews!).ThenInclude(r => r.Usuario)
                .Include(f => f.Servicos!)
                .Include(f => f.Favoritos!)
                .ToListAsync();

            return funerarias.Select(f => f.ToDto()!).ToList();
        }

        // GET: api/Funerarias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FunerariaDto>> GetFuneraria(int id)
        {
            var funeraria = await _context.Funerarias
                .Include(f => f.Reviews!).ThenInclude(r => r.Usuario)
                .Include(f => f.Servicos!)
                .Include(f => f.Favoritos!)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (funeraria == null)
            {
                return NotFound();
            }

            return funeraria.ToDto()!;
        }

        // PUT: api/Funerarias/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutFuneraria(int id, Funeraria funeraria)
        {
            var existing = await _context.Funerarias.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Nome = funeraria.Nome;
            existing.Descricao = funeraria.Descricao;
            existing.Cidade = funeraria.Cidade;
            existing.Estado = funeraria.Estado;
            existing.Telefone = funeraria.Telefone;
            existing.Endereco = funeraria.Endereco;
            existing.Horario = funeraria.Horario;

            // Se lat/lng foram informados, usa direto; senão geocodifica
            if (funeraria.Latitude.HasValue && funeraria.Longitude.HasValue)
            {
                existing.Latitude = funeraria.Latitude;
                existing.Longitude = funeraria.Longitude;
            }
            else
            {
                var coords = await _geocoding.GeocodeAsync(funeraria.Endereco, funeraria.Cidade, funeraria.Estado);
                if (coords != null)
                {
                    existing.Latitude = coords.Latitude;
                    existing.Longitude = coords.Longitude;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FunerariaExists(id))
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

        // POST: api/Funerarias
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<FunerariaDto>> PostFuneraria(Funeraria funeraria)
        {
            // Geocodifica se lat/lng não foram informados
            if (!funeraria.Latitude.HasValue || !funeraria.Longitude.HasValue)
            {
                var coords = await _geocoding.GeocodeAsync(funeraria.Endereco, funeraria.Cidade, funeraria.Estado);
                if (coords != null)
                {
                    funeraria.Latitude = coords.Latitude;
                    funeraria.Longitude = coords.Longitude;
                }
            }

            _context.Funerarias.Add(funeraria);
            await _context.SaveChangesAsync();

            var created = await _context.Funerarias
                .Include(f => f.Reviews!)
                .Include(f => f.Servicos!)
                .Include(f => f.Favoritos!)
                .FirstOrDefaultAsync(f => f.Id == funeraria.Id);

            return CreatedAtAction("GetFuneraria", new { id = funeraria.Id }, created!.ToDto()!);
        }

        // DELETE: api/Funerarias/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteFuneraria(int id)
        {
            var funeraria = await _context.Funerarias.FindAsync(id);
            if (funeraria == null)
            {
                return NotFound();
            }

            _context.Funerarias.Remove(funeraria);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FunerariaExists(int id)
        {
            return _context.Funerarias.Any(e => e.Id == id);
        }
    }
}
