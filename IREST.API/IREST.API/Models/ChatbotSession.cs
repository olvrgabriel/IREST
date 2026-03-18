namespace IREST.API.Models
{
    public class ChatbotSession
    {
        public int Id { get; set; }
        public DateTime DataInicio { get; set; } = DateTime.Now;

        public int UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        public ICollection<ChatbotMessage>? Mensagens { get; set; }
    }
}
