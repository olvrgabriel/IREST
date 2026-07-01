namespace IREST.API.Models
{
    public class Funeraria
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string Cidade { get; set; } = string.Empty;
        public string? Estado { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Telefone { get; set; }
        public string? Endereco { get; set; }
        public string? Horario { get; set; }

        // Credenciais de login da funeraria
        public string? Email { get; set; }
        public string? Senha { get; set; }
        public string? PerguntaSeguranca { get; set; }
        public string? RespostaSeguranca { get; set; }

        public ICollection<Review>? Reviews { get; set; }
        // Relacionamento N:N com Servico (via tabela associativa FunerariaServico)
        public ICollection<FunerariaServico>? FunerariaServicos { get; set; }
        public ICollection<Favorito>? Favoritos { get; set; }
    }
}
