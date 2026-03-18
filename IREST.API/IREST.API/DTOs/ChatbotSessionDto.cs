using System;
using System.Collections.Generic;

namespace IREST.API.DTOs
{
    public class ChatbotSessionDto
    {
        public int Id { get; set; }
        public DateTime DataInicio { get; set; }

        public int UsuarioId { get; set; }

        public List<ChatbotMessageDto> Mensagens { get; set; }
    }
}
