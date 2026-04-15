namespace IREST.API.DTOs
{
    public class FavoritoDto
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        public string? UsuarioNome { get; set; }

        public int FunerariaId { get; set; }
        public string? FunerariaNome { get; set; }
    }
}
