namespace IREST.API.Models
{
    public class Admin
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }

        public ICollection<Review> ReviewsModeradas { get; set; }
    }
}
