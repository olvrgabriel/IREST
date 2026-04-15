using System.Collections.Generic;

namespace IREST.API.DTOs
{
    public class FunerariaDto
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

        public List<ReviewDto>? Reviews { get; set; }
        public List<ServicoDto>? Servicos { get; set; }
        public List<FavoritoDto>? Favoritos { get; set; }
    }
}
