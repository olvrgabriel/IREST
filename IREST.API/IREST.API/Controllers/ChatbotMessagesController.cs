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
    public class ChatbotMessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatbotMessagesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ChatbotMessages - admin ve tudo; usuario ve so das proprias sessoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChatbotMessageDto>>> GetChatbotMessages(int page = 1, int pageSize = 100)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 500 ? 100 : pageSize;

            IQueryable<ChatbotMessage> query = _context.ChatbotMessages;

            if (!User.IsAdmin())
            {
                var uid = User.GetUserId();
                if (uid == null) return Forbid();

                var ownedSessionIds = _context.ChatbotSessions
                    .Where(s => s.UsuarioId == uid.Value)
                    .Select(s => s.Id);
                query = query.Where(m => ownedSessionIds.Contains(m.ChatbotSessionId));
            }

            var messages = await query
                .OrderByDescending(m => m.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return messages.Select(m => m.ToDto()!).ToList();
        }

        // GET: api/ChatbotMessages/5 - dono da sessao ou admin
        [HttpGet("{id}")]
        public async Task<ActionResult<ChatbotMessageDto>> GetChatbotMessage(int id)
        {
            var message = await _context.ChatbotMessages
                .Include(m => m.ChatbotSession)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (message == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && message.ChatbotSession?.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            return message.ToDto()!;
        }

        // PUT: api/ChatbotMessages/5 - somente admin (moderacao)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutChatbotMessage(int id, ChatbotMessage message)
        {
            var existing = await _context.ChatbotMessages.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Mensagem = message.Mensagem;
            existing.Remetente = message.Remetente;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChatbotMessageExists(id))
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

        // POST: api/ChatbotMessages - precisa ser dono da sessao
        [HttpPost]
        public async Task<ActionResult<ChatbotMessageDto>> PostChatbotMessage(ChatbotMessage message)
        {
            var session = await _context.ChatbotSessions.FindAsync(message.ChatbotSessionId);
            if (session == null)
            {
                return BadRequest(new { message = "Sessao invalida" });
            }

            if (!User.IsAdmin() && session.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            _context.ChatbotMessages.Add(message);
            await _context.SaveChangesAsync();

            var created = await _context.ChatbotMessages
                .FirstOrDefaultAsync(m => m.Id == message.Id);

            return CreatedAtAction("GetChatbotMessage", new { id = message.Id }, created!.ToDto()!);
        }

        // DELETE: api/ChatbotMessages/5 - somente admin
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteChatbotMessage(int id)
        {
            var message = await _context.ChatbotMessages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            _context.ChatbotMessages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ChatbotMessageExists(int id)
        {
            return _context.ChatbotMessages.Any(e => e.Id == id);
        }
    }
}
