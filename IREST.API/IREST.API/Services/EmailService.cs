using MailKit.Net.Smtp;
using MimeKit;

namespace IREST.API.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendPasswordResetEmail(string toEmail, string token)
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
            var smtpUser = _configuration["Smtp:User"];
            var smtpPassword = _configuration["Smtp:Password"];
            var fromName = _configuration["Smtp:FromName"] ?? "IREST";
            var fromEmail = _configuration["Smtp:FromEmail"] ?? smtpUser;

            if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpUser))
            {
                _logger.LogWarning("SMTP nao configurado. Token de recuperacao para {Email}: {Token}", toEmail, token);
                return false;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "IREST - Recuperacao de Senha";

            message.Body = new TextPart("html")
            {
                Text = $@"
                <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #2563eb; text-align: center;'>IREST</h2>
                    <h3 style='text-align: center;'>Recuperacao de Senha</h3>
                    <p>Voce solicitou a recuperacao da sua senha. Use o codigo abaixo para redefinir:</p>
                    <div style='background: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>
                        <span style='font-size: 2rem; font-weight: bold; letter-spacing: 4px; color: #2563eb;'>{token}</span>
                    </div>
                    <p style='color: #666; font-size: 0.9rem;'>Este codigo e valido por <strong>30 minutos</strong>.</p>
                    <p style='color: #666; font-size: 0.9rem;'>Se voce nao solicitou esta recuperacao, ignore este email.</p>
                    <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                    <p style='color: #999; font-size: 0.8rem; text-align: center;'>IREST - Sistema de Funerarias</p>
                </div>"
            };

            try
            {
                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(smtpUser, smtpPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email de recuperacao enviado para {Email}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha ao enviar email de recuperacao para {Email}", toEmail);
                return false;
            }
        }
    }
}
