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

        public ICollection<Review>? Reviews { get; set; }
        public ICollection<Servico>? Servicos { get; set; }
        public ICollection<Favorito>? Favoritos { get; set; }
    }
}
