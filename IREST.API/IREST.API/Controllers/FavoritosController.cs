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
    [Authorize(Roles = "usuario,admin")]
    public class FavoritosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Favoritos - usuario ve so os seus; admin ve tudo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FavoritoDto>>> GetFavoritos()
        {
            IQueryable<Favorito> query = _context.Favoritos
                .Include(f => f.Usuario)
                .Include(f => f.Funeraria);

            if (!User.IsAdmin())
            {
                var uid = User.GetUserId();
                if (uid == null) return Forbid();
                query = query.Where(f => f.UsuarioId == uid.Value);
            }

            var favoritos = await query.ToListAsync();
            return favoritos.Select(f => f.ToDto()!).ToList();
        }

        // GET: api/Favoritos/5 - dono ou admin
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

            if (!User.IsAdmin() && favorito.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            return favorito.ToDto()!;
        }

        // PUT: api/Favoritos/5 - dono ou admin, nao permite trocar dono
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFavorito(int id, Favorito favorito)
        {
            var existing = await _context.Favoritos.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && existing.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            // Apenas admin pode reatribuir dono
            if (User.IsAdmin())
            {
                existing.UsuarioId = favorito.UsuarioId;
            }
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

        // POST: api/Favoritos - sempre cria para o usuario logado
        [HttpPost]
        public async Task<ActionResult<FavoritoDto>> PostFavorito(Favorito favorito)
        {
            var uid = User.GetUserId();
            if (uid == null) return Forbid();

            // Sobrescreve UsuarioId vindo do cliente (nao confiavel)
            favorito.UsuarioId = User.IsAdmin() && favorito.UsuarioId > 0 ? favorito.UsuarioId : uid.Value;

            // Evita duplicidade (mesma funeraria/usuario)
            var jaExiste = await _context.Favoritos.AnyAsync(f =>
                f.UsuarioId == favorito.UsuarioId && f.FunerariaId == favorito.FunerariaId);
            if (jaExiste)
            {
                return Conflict(new { message = "Funeraria ja esta nos favoritos" });
            }

            _context.Favoritos.Add(favorito);
            await _context.SaveChangesAsync();

            var created = await _context.Favoritos
                .Include(f => f.Usuario)
                .Include(f => f.Funeraria)
                .FirstOrDefaultAsync(f => f.Id == favorito.Id);

            return CreatedAtAction("GetFavorito", new { id = favorito.Id }, created!.ToDto()!);
        }

        // DELETE: api/Favoritos/5 - dono ou admin
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFavorito(int id)
        {
            var favorito = await _context.Favoritos.FindAsync(id);
            if (favorito == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && favorito.UsuarioId != User.GetUserId())
            {
                return Forbid();
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
