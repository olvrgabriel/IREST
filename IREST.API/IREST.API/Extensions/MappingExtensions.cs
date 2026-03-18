using System.Linq;
using IREST.API.Models;
using IREST.API.DTOs;

namespace IREST.API.Extensions
{
    public static class MappingExtensions
    {
        public static AdminDto ToDto(this Admin admin)
            => admin == null ? null : new AdminDto
            {
                Id = admin.Id,
                Nome = admin.Nome,
                Email = admin.Email
            };

        public static UsuarioDto ToDto(this Usuario u)
            => u == null ? null : new UsuarioDto
            {
                Id = u.Id,
                Nome = u.Nome,
                Email = u.Email,
                DataCadastro = u.DataCadastro,
                Reviews = u.Reviews?.Select(r => r.ToDto()).ToList(),
                Favoritos = u.Favoritos?.Select(f => f.ToDto()).ToList(),
                Sessoes = u.Sessoes?.Select(s => s.ToDto()).ToList()
            };

        public static FunerariaDto ToDto(this Funeraria f)
            => f == null ? null : new FunerariaDto
            {
                Id = f.Id,
                Nome = f.Nome,
                Descricao = f.Descricao,
                Cidade = f.Cidade,
                Estado = f.Estado,
                Latitude = f.Latitude,
                Longitude = f.Longitude,
                Telefone = f.Telefone,
                Endereco = f.Endereco,
                Horario = f.Horario,
                Reviews = f.Reviews?.Select(r => r.ToDto()).ToList(),
                Servicos = f.Servicos?.Select(s => s.ToDto()).ToList(),
                Favoritos = f.Favoritos?.Select(fr => fr.ToDto()).ToList()
            };

        public static ReviewDto ToDto(this Review r)
            => r == null ? null : new ReviewDto
            {
                Id = r.Id,
                Nota = r.Nota,
                Comentario = r.Comentario,
                DataAvaliacao = r.DataAvaliacao,
                UsuarioId = r.UsuarioId,
                UsuarioNome = r.Usuario?.Nome,
                FunerariaId = r.FunerariaId,
                AdminId = r.AdminId,
                AdminNome = r.Admin?.Nome
            };

        public static ServicoDto ToDto(this Servico s)
            => s == null ? null : new ServicoDto
            {
                Id = s.Id,
                Nome = s.Nome,
                Descricao = s.Descricao,
                Preco = s.Preco,
                FunerariaId = s.FunerariaId,
                FunerariaNome = s.Funeraria?.Nome
            };

        public static FavoritoDto ToDto(this Favorito f)
            => f == null ? null : new FavoritoDto
            {
                Id = f.Id,
                UsuarioId = f.UsuarioId,
                UsuarioNome = f.Usuario?.Nome,
                FunerariaId = f.FunerariaId,
                FunerariaNome = f.Funeraria?.Nome
            };

        public static ChatbotMessageDto ToDto(this ChatbotMessage m)
            => m == null ? null : new ChatbotMessageDto
            {
                Id = m.Id,
                Mensagem = m.Mensagem,
                Remetente = m.Remetente,
                DataEnvio = m.DataEnvio,
                ChatbotSessionId = m.ChatbotSessionId
            };

        public static ChatbotSessionDto ToDto(this ChatbotSession s)
            => s == null ? null : new ChatbotSessionDto
            {
                Id = s.Id,
                DataInicio = s.DataInicio,
                UsuarioId = s.UsuarioId,
                Mensagens = s.Mensagens?.Select(m => m.ToDto()).ToList()
            };
    }
}
