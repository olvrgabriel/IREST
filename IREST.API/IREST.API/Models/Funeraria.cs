namespace IREST.API.Models
{
    public class Funeraria
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public string Cidade { get; set; }
        public string Estado { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Telefone { get; set; }
        public string? Endereco { get; set; }
        public string? Horario { get; set; }

        public ICollection<Review> Reviews { get; set; }
        public ICollection<Servico> Servicos { get; set; }
        public ICollection<Favorito> Favoritos { get; set; }
    }
}
