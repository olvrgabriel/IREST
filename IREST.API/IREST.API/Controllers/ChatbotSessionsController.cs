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
    [Authorize]
    public class ChatbotSessionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatbotSessionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ChatbotSessions - admin ve tudo; usuario ve so o que e dele
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChatbotSessionDto>>> GetChatbotSessions(int page = 1, int pageSize = 50)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

            IQueryable<ChatbotSession> query = _context.ChatbotSessions
                .Include(s => s.Usuario)
                .Include(s => s.Mensagens);

            if (!User.IsAdmin())
            {
                var uid = User.GetUserId();
                if (uid == null) return Forbid();
                query = query.Where(s => s.UsuarioId == uid.Value);
            }

            var sessions = await query
                .OrderByDescending(s => s.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return sessions.Select(s => s.ToDto()!).ToList();
        }

        // GET: api/ChatbotSessions/5 - dono ou admin
        [HttpGet("{id}")]
        public async Task<ActionResult<ChatbotSessionDto>> GetChatbotSession(int id)
        {
            var session = await _context.ChatbotSessions
                .Include(s => s.Usuario)
                .Include(s => s.Mensagens)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && session.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            return session.ToDto()!;
        }

        // PUT: api/ChatbotSessions/5 - somente admin
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutChatbotSession(int id, ChatbotSession session)
        {
            var existing = await _context.ChatbotSessions.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.UsuarioId = session.UsuarioId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChatbotSessionExists(id))
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

        // POST: api/ChatbotSessions - cria sempre no contexto do usuario logado
        [HttpPost]
        public async Task<ActionResult<ChatbotSessionDto>> PostChatbotSession(ChatbotSession session)
        {
            var uid = User.GetUserId();
            if (uid == null) return Forbid();

            // Ignora UsuarioId vindo do cliente: forca o do token
            session.UsuarioId = User.IsAdmin() && session.UsuarioId > 0 ? session.UsuarioId : uid.Value;

            _context.ChatbotSessions.Add(session);
            await _context.SaveChangesAsync();

            var created = await _context.ChatbotSessions
                .Include(s => s.Usuario)
                .Include(s => s.Mensagens)
                .FirstOrDefaultAsync(s => s.Id == session.Id);

            return CreatedAtAction("GetChatbotSession", new { id = session.Id }, created!.ToDto()!);
        }

        // DELETE: api/ChatbotSessions/5 - dono ou admin
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChatbotSession(int id)
        {
            var session = await _context.ChatbotSessions.FindAsync(id);
            if (session == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && session.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            _context.ChatbotSessions.Remove(session);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ChatbotSessionExists(int id)
        {
            return _context.ChatbotSessions.Any(e => e.Id == id);
        }
    }
}
