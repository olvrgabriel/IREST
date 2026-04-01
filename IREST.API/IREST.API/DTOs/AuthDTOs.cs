namespace IREST.API.DTOs
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }

    public class RegisterFunerariaRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Cidade { get; set; } = string.Empty;
        public string? Estado { get; set; }
        public string? Telefone { get; set; }
        public string? Endereco { get; set; }
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
