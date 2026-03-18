namespace IREST.API.DTOs
{
    public class ServicoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public decimal Preco { get; set; }

        public int FunerariaId { get; set; }
        public string FunerariaNome { get; set; }
    }
}
