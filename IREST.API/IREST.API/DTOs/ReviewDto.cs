using System;

namespace IREST.API.DTOs
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int Nota { get; set; }
        public string? Comentario { get; set; }
        public DateTime DataAvaliacao { get; set; }

        public int UsuarioId { get; set; }
        public string? UsuarioNome { get; set; }

        public int FunerariaId { get; set; }

        public int? AdminId { get; set; }
        public string? AdminNome { get; set; }
    }
}
