using System;
using System.Collections.Generic;

namespace IREST.API.DTOs
{
    public class UsuarioDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public DateTime DataCadastro { get; set; }

        public List<ReviewDto> Reviews { get; set; }
        public List<FavoritoDto> Favoritos { get; set; }
        public List<ChatbotSessionDto> Sessoes { get; set; }
    }
}
