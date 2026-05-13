namespace IREST.API.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Senha { get; set; }
        public string? PerguntaSeguranca { get; set; }
        public string? RespostaSeguranca { get; set; }
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public ICollection<Review>? Reviews { get; set; }
        public ICollection<Favorito>? Favoritos { get; set; }
        public ICollection<ChatbotSession>? Sessoes { get; set; }
    }
}
