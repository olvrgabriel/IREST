using System;

namespace IREST.API.DTOs
{
    public class ChatbotMessageDto
    {
        public int Id { get; set; }
        public string Mensagem { get; set; }
        public string Remetente { get; set; }
        public DateTime DataEnvio { get; set; }

        public int ChatbotSessionId { get; set; }
    }
}
