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
    public class ChatbotSessionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatbotSessionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ChatbotSessions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChatbotSessionDto>>> GetChatbotSessions()
        {
            var sessions = await _context.ChatbotSessions
                .Include(s => s.Usuario)
                .Include(s => s.Mensagens)
                .ToListAsync();

            return sessions.Select(s => s.ToDto()).ToList();
        }

        // GET: api/ChatbotSessions/5
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

            return session.ToDto();
        }

        // PUT: api/ChatbotSessions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutChatbotSession(int id, ChatbotSession session)
        {
            if (id != session.Id)
            {
                return BadRequest();
            }

            _context.Entry(session).State = EntityState.Modified;

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

        // POST: api/ChatbotSessions
        [HttpPost]
        public async Task<ActionResult<ChatbotSessionDto>> PostChatbotSession(ChatbotSession session)
        {
            _context.ChatbotSessions.Add(session);
            await _context.SaveChangesAsync();

            var created = await _context.ChatbotSessions
                .Include(s => s.Usuario)
                .Include(s => s.Mensagens)
                .FirstOrDefaultAsync(s => s.Id == session.Id);

            return CreatedAtAction("GetChatbotSession", new { id = session.Id }, created.ToDto());
        }

        // DELETE: api/ChatbotSessions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChatbotSession(int id)
        {
            var session = await _context.ChatbotSessions.FindAsync(id);
            if (session == null)
            {
                return NotFound();
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
