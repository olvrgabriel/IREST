using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class FavoritosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Favoritos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FavoritoDto>>> GetFavoritos()
        {
            var favoritos = await _context.Favoritos
                .Include(f => f.Usuario)
                .Include(f => f.Funeraria)
                .ToListAsync();

            return favoritos.Select(f => f.ToDto()).ToList();
        }

        // GET: api/Favoritos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FavoritoDto>> GetFavorito(int id)
        {
            var favorito = await _context.Favoritos
                .Include(f => f.Usuario)
                .Include(f => f.Funeraria)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (favorito == null)
            {
                return NotFound();
            }

            return favorito.ToDto();
        }

        // PUT: api/Favoritos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFavorito(int id, Favorito favorito)
        {
            var existing = await _context.Favoritos.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.UsuarioId = favorito.UsuarioId;
            existing.FunerariaId = favorito.FunerariaId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FavoritoExists(id))
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

        // POST: api/Favoritos
        [HttpPost]
        public async Task<ActionResult<FavoritoDto>> PostFavorito(Favorito favorito)
        {
            _context.Favoritos.Add(favorito);
            await _context.SaveChangesAsync();

            var created = await _context.Favoritos
                .Include(f => f.Usuario)
                .Include(f => f.Funeraria)
                .FirstOrDefaultAsync(f => f.Id == favorito.Id);

            return CreatedAtAction("GetFavorito", new { id = favorito.Id }, created.ToDto());
        }

        // DELETE: api/Favoritos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFavorito(int id)
        {
            var favorito = await _context.Favoritos.FindAsync(id);
            if (favorito == null)
            {
                return NotFound();
            }

            _context.Favoritos.Remove(favorito);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FavoritoExists(int id)
        {
            return _context.Favoritos.Any(e => e.Id == id);
        }
    }
}
