namespace IREST.API.Models
{
    public class Servico
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Preco { get; set; }

        // Relacionamento N:N com Funeraria (via tabela associativa FunerariaServico)
        public ICollection<FunerariaServico>? FunerariaServicos { get; set; }
    }
}
