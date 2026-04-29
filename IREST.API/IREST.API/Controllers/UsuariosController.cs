using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IREST.API.Data;
using IREST.API.Models;
using IREST.API.DTOs;
using IREST.API.Extensions;
using BCrypt.Net;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Usuarios - Somente admin, paginado
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios(int page = 1, int pageSize = 50)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

            var usuarios = await _context.Usuarios
                .OrderBy(u => u.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(u => u.Reviews)
                .Include(u => u.Favoritos)
                .Include(u => u.Sessoes)
                .ToListAsync();

            return usuarios.Select(u => u.ToDto()!).ToList();
        }

        // GET: api/Usuarios/5 - admin ou o proprio usuario
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<UsuarioDto>> GetUsuario(int id)
        {
            if (!User.IsAdmin() && User.GetUserId() != id)
            {
                return Forbid();
            }

            var usuario = await _context.Usuarios
                .Include(u => u.Reviews)
                .Include(u => u.Favoritos)
                .Include(u => u.Sessoes)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                return NotFound();
            }

            return usuario.ToDto()!;
        }

        // PUT: api/Usuarios/5 - admin ou o proprio usuario
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
        {
            if (!User.IsAdmin() && User.GetUserId() != id)
            {
                return Forbid();
            }

            var existing = await _context.Usuarios.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Nome = usuario.Nome;

            // Somente admin pode trocar o email (mudanca e-mail = risco de takeover)
            if (User.IsAdmin() && !string.IsNullOrWhiteSpace(usuario.Email))
            {
                existing.Email = usuario.Email;
            }

            if (!string.IsNullOrEmpty(usuario.Senha))
                existing.Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UsuarioExists(id))
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

        // POST: api/Usuarios - Desabilitado: use /api/Auth/register
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UsuarioDto>> PostUsuario(Usuario usuario)
        {
            if (!string.IsNullOrEmpty(usuario.Senha))
                usuario.Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha);

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var created = await _context.Usuarios
                .Include(u => u.Reviews)
                .Include(u => u.Favoritos)
                .Include(u => u.Sessoes)
                .FirstOrDefaultAsync(u => u.Id == usuario.Id);

            return CreatedAtAction("GetUsuario", new { id = usuario.Id }, created!.ToDto()!);
        }

        // DELETE: api/Usuarios/5 - Somente admin
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UsuarioExists(int id)
        {
            return _context.Usuarios.Any(e => e.Id == id);
        }
    }
}
