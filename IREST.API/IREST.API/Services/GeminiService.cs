using System.Text;
using System.Text.Json;

namespace IREST.API.Services
{
    public class GeminiMessage
    {
        public string Remetente { get; set; } = string.Empty; // "user" ou "bot"
        public string Texto { get; set; } = string.Empty;
    }

    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent";

        private const string SystemPrompt =
            "Você é o assistente virtual oficial da plataforma IREST. Responda SEMPRE em português brasileiro. Seja empático, respeitoso e objetivo — os usuários podem estar passando por um momento de luto.\n\n" +

            "## SOBRE A PLATAFORMA IREST\n" +
            "O IREST é uma plataforma web brasileira que conecta famílias a funerárias cadastradas, permitindo buscar, comparar e avaliar serviços funerários com transparência.\n\n" +

            "## FUNCIONALIDADES DA PLATAFORMA\n" +
            "- **Página inicial**: apresenta funerárias em destaque e campo de busca por cidade/nome.\n" +
            "- **Busca**: filtro por cidade, estado e nome da funerária. Exibe lista de resultados com nome, cidade, nota média e número de avaliações. Também há um mapa interativo (Leaflet/OpenStreetMap) mostrando as funerárias no mapa.\n" +
            "- **Página de detalhes da funerária**: exibe nome, endereço, telefone, e-mail, lista de serviços oferecidos com preços, nota média, distribuição de estrelas e todas as avaliações dos usuários.\n" +
            "- **Avaliações**: usuários logados podem avaliar funerárias com nota de 1 a 5 estrelas e um comentário. Para avaliar, acesse a página da funerária e clique em 'Avaliar'.\n" +
            "- **Favoritos**: usuários logados podem salvar funerárias favoritas. Os favoritos ficam salvos no Painel do Usuário.\n" +
            "- **Como Funciona**: página explicativa sobre o funcionamento da plataforma.\n" +
            "- **Central de Ajuda (este chat)**: suporte via IA para dúvidas sobre a plataforma.\n\n" +

            "## TIPOS DE USUÁRIO\n" +
            "- **Usuário comum**: pode buscar funerárias, ver detalhes, avaliar, favoritar e acessar seu painel pessoal (histórico de avaliações, favoritos).\n" +
            "- **Funerária (prestador)**: tem acesso ao Painel da Funerária onde pode editar seus dados, gerenciar os serviços oferecidos, ver suas avaliações e relatórios.\n" +
            "- **Administrador**: acessa o Painel Admin com CRUD completo de funerárias, usuários, avaliações, serviços e admins, além de estatísticas gerais.\n\n" +

            "## CADASTRO E LOGIN\n" +
            "- Cadastro de usuário: nome, e-mail e senha.\n" +
            "- Cadastro de funerária: nome, e-mail, senha, cidade, estado, telefone e endereço.\n" +
            "- Login unificado para todos os tipos de usuário.\n" +
            "- Credenciais admin padrão do sistema: e-mail 'admin@irest.com'.\n\n" +

            "## SERVIÇOS FUNERÁRIOS\n" +
            "Cada funerária pode cadastrar seus serviços com nome, descrição e preço. Exemplos comuns: translado, velório, cremação, sepultamento, urna/caixão, documentação.\n\n" +

            "## DOCUMENTAÇÃO NECESSÁRIA (geral no Brasil)\n" +
            "- Certidão de óbito (fornecida pelo médico ou IML)\n" +
            "- Documento de identidade do falecido (RG, CPF)\n" +
            "- Documento de identidade do responsável pelo funeral\n" +
            "- Comprovante de residência do responsável\n" +
            "- Autorização do cemitério ou crematório (quando aplicável)\n" +
            "A funerária pode solicitar documentos adicionais conforme o caso.\n\n" +

            "## ROTAS DA PLATAFORMA\n" +
            "- `/` — Página inicial\n" +
            "- `/busca` — Busca de funerárias\n" +
            "- `/detalhes/:id` — Detalhes de uma funerária\n" +
            "- `/avaliar/:id` — Formulário de avaliação (requer login de usuário)\n" +
            "- `/meu-painel` — Painel do usuário\n" +
            "- `/painel-funeraria` — Painel da funerária\n" +
            "- `/painel-admin` — Painel do administrador\n" +
            "- `/como-funciona` — Como funciona\n" +
            "- `/chat` — Esta central de ajuda\n" +
            "- `/cadastro` — Cadastro de usuário\n" +
            "- `/cadastro-funeraria` — Cadastro de funerária\n\n" +

            "## REGRAS IMPORTANTES\n" +
            "- Só responda sobre o IREST e temas relacionados a serviços funerários, luto e burocracia pós-óbito no Brasil.\n" +
            "- Se não souber algo específico, oriente o usuário a contatar a funerária diretamente ou acessar a página de detalhes dela.\n" +
            "- Nunca invente dados de funerárias, preços ou serviços específicos — apenas explique como encontrá-los na plataforma.\n" +
            "- Mantenha sempre um tom respeitoso e acolhedor.";

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        }

        public async Task<string> SendMessageAsync(string mensagem, List<GeminiMessage> historico)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return "O serviço de IA não está configurado. Por favor, configure a chave da API Gemini.";
            }

            try
            {
                // Monta o histórico de conversa no formato Gemini
                // Gemma nao suporta systemInstruction, entao injetamos o prompt como primeira mensagem
                var contents = new List<object>();

                // Limita historico às últimas 10 mensagens para não estourar o contexto
                var historicoRecente = historico.TakeLast(10).ToList();

                // Primeira mensagem do usuário recebe o SystemPrompt prefixado
                bool isFirstUserMessage = true;

                foreach (var msg in historicoRecente)
                {
                    var role = msg.Remetente == "user" ? "user" : "model";
                    var texto = msg.Texto;

                    if (role == "user" && isFirstUserMessage)
                    {
                        texto = SystemPrompt + "\n\n---\n\nPergunta do usuário:\n" + texto;
                        isFirstUserMessage = false;
                    }

                    contents.Add(new
                    {
                        role,
                        parts = new[] { new { text = texto } }
                    });
                }

                // Adiciona a mensagem atual do usuário (prepend do prompt se for a primeira)
                var mensagemFinal = isFirstUserMessage
                    ? SystemPrompt + "\n\n---\n\nPergunta do usuário:\n" + mensagem
                    : mensagem;

                contents.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = mensagemFinal } }
                });

                var requestBody = new
                {
                    contents,
                    generationConfig = new
                    {
                        temperature = 0.7,
                        maxOutputTokens = 512
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                using var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}?key={_apiKey}");
                request.Content = content;

                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(15));
                var response = await _httpClient.SendAsync(request, cts.Token);
                var responseText = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[Gemini] Status: {(int)response.StatusCode} {response.StatusCode}");
                if (!response.IsSuccessStatusCode)
                    Console.WriteLine($"[Gemini] Body: {responseText[..Math.Min(500, responseText.Length)]}");

                if (!response.IsSuccessStatusCode)
                {
                    return "Desculpe, não consegui processar sua mensagem no momento. Tente novamente em alguns instantes.";
                }

                using var doc = JsonDocument.Parse(responseText);
                var root = doc.RootElement;

                // Verifica se há candidatos na resposta
                if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    Console.WriteLine($"[Gemini] Sem candidatos na resposta: {responseText}");
                    return "Não consegui gerar uma resposta adequada. Por favor, reformule sua pergunta.";
                }

                var firstCandidate = candidates[0];

                // Verifica finish reason (pode ser SAFETY, RECITATION, etc.)
                if (firstCandidate.TryGetProperty("finishReason", out var finishReason) &&
                    finishReason.GetString() != "STOP" && finishReason.GetString() != "MAX_TOKENS")
                {
                    Console.WriteLine($"[Gemini] FinishReason: {finishReason.GetString()}");
                    return "Não consegui responder essa mensagem. Por favor, tente reformular sua pergunta.";
                }

                if (!firstCandidate.TryGetProperty("content", out var candidateContent) ||
                    !candidateContent.TryGetProperty("parts", out var parts) ||
                    parts.GetArrayLength() == 0)
                {
                    Console.WriteLine($"[Gemini] Resposta sem content/parts: {responseText}");
                    return "Não consegui gerar uma resposta. Por favor, tente novamente.";
                }

                // Concatena todos os parts com texto (ignorando partes "thought" de modelos com thinking)
                var sb = new StringBuilder();
                foreach (var part in parts.EnumerateArray())
                {
                    // Pula partes marcadas como pensamento
                    if (part.TryGetProperty("thought", out var isThought) &&
                        isThought.ValueKind == JsonValueKind.True)
                    {
                        continue;
                    }
                    if (part.TryGetProperty("text", out var textProp))
                    {
                        sb.Append(textProp.GetString());
                    }
                }

                var finalText = sb.ToString().Trim();
                Console.WriteLine($"[Gemini] Resposta gerada ({finalText.Length} chars)");

                return string.IsNullOrWhiteSpace(finalText)
                    ? "Não consegui gerar uma resposta. Por favor, tente novamente."
                    : finalText;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini error: {ex.Message}");
                return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
            }
        }
    }
}
