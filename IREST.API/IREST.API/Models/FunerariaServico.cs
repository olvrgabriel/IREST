namespace IREST.API.Models
{
    /// <summary>
    /// Tabela associativa que resolve o relacionamento N:N entre Funeraria e Servico.
    /// Cada linha representa um servico oferecido por uma funeraria.
    /// </summary>
    public class FunerariaServico
    {
        public int FunerariaId { get; set; }
        public Funeraria? Funeraria { get; set; }

        public int ServicoId { get; set; }
        public Servico? Servico { get; set; }
    }
}
