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

        // GET: api/ChatbotMessages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChatbotMessageDto>>> GetChatbotMessages()
        {
            var messages = await _context.ChatbotMessages
                .ToListAsync();

            return messages.Select(m => m.ToDto()!).ToList();
        }

        // GET: api/ChatbotMessages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ChatbotMessageDto>> GetChatbotMessage(int id)
        {
            var message = await _context.ChatbotMessages
                .FirstOrDefaultAsync(m => m.Id == id);

            if (message == null)
            {
                return NotFound();
            }

            return message.ToDto()!;
        }

        // PUT: api/ChatbotMessages/5
        [HttpPut("{id}")]
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

        // POST: api/ChatbotMessages
        [HttpPost]
        public async Task<ActionResult<ChatbotMessageDto>> PostChatbotMessage(ChatbotMessage message)
        {
            _context.ChatbotMessages.Add(message);
            await _context.SaveChangesAsync();

            var created = await _context.ChatbotMessages
                .FirstOrDefaultAsync(m => m.Id == message.Id);

            return CreatedAtAction("GetChatbotMessage", new { id = message.Id }, created!.ToDto()!);
        }

        // DELETE: api/ChatbotMessages/5
        [HttpDelete("{id}")]
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
