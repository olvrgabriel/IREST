using System;

namespace IREST.API.DTOs
{
    public class ChatbotMessageDto
    {
        public int Id { get; set; }
        public string Mensagem { get; set; } = string.Empty;
        public string Remetente { get; set; } = string.Empty;
        public DateTime DataEnvio { get; set; }

        public int ChatbotSessionId { get; set; }
    }
}
