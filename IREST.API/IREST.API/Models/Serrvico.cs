namespace IREST.API.Models
{
    public class Servico
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Preco { get; set; }

        public int FunerariaId { get; set; }
        public Funeraria? Funeraria { get; set; }
    }
}
