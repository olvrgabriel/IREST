namespace IREST.API.Models
{
    public class Favorito
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; }

        public int FunerariaId { get; set; }
        public Funeraria Funeraria { get; set; }
    }
}
