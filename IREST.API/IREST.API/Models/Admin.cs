namespace IREST.API.Models
{
    public class Admin
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Senha { get; set; }
        public string? PerguntaSeguranca { get; set; }
        public string? RespostaSeguranca { get; set; }

        public ICollection<Review>? ReviewsModeradas { get; set; }
    }
}
