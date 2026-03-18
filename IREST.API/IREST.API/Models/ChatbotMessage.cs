namespace IREST.API.Models
{
    public class ChatbotMessage
    {
        public int Id { get; set; }
        public string Mensagem { get; set; } = string.Empty;
        public string Remetente { get; set; } = string.Empty;
        public DateTime DataEnvio { get; set; } = DateTime.Now;

        public int ChatbotSessionId { get; set; }
        public ChatbotSession? ChatbotSession { get; set; }
    }
}
