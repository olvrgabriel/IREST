namespace IREST.API.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int Nota { get; set; }
        public string Comentario { get; set; }
        public DateTime DataAvaliacao { get; set; } = DateTime.Now;

        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; }

        public int FunerariaId { get; set; }
        public Funeraria Funeraria { get; set; }

        public int? AdminId { get; set; }
        public Admin Admin { get; set; }
    }
}
