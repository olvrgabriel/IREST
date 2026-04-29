using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IREST.API.Services;

namespace IREST.API.Controllers
{
    public class ChatbotRequest
    {
        public string Mensagem { get; set; } = string.Empty;
        public List<GeminiMessage> Historico { get; set; } = new();
    }

    public class ChatbotResponse
    {
        public string Resposta { get; set; } = string.Empty;
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatbotController : ControllerBase
    {
        private readonly GeminiService _gemini;

        public ChatbotController(GeminiService gemini)
        {
            _gemini = gemini;
        }

        // POST: api/Chatbot/message
        [HttpPost("message")]
        public async Task<ActionResult<ChatbotResponse>> SendMessage([FromBody] ChatbotRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Mensagem))
            {
                return BadRequest(new { message = "Mensagem não pode ser vazia" });
            }

            var resposta = await _gemini.SendMessageAsync(request.Mensagem, request.Historico);

            return Ok(new ChatbotResponse { Resposta = resposta });
        }
    }
}
