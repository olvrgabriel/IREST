namespace IREST.API.DTOs
{
    public class ServicoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Preco { get; set; }

        public int FunerariaId { get; set; }
        public string? FunerariaNome { get; set; }
    }

    /// <summary>
    /// Corpo de criacao/edicao de servico. FunerariaId so e usado pelo admin
    /// (a funeraria usa o proprio id do token).
    /// </summary>
    public class ServicoRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Preco { get; set; }
        public int FunerariaId { get; set; }
    }
}
