export interface ChatbotMessage {
  id: number;
  mensagem: string;
  remetente: string;
  dataEnvio: string;
  chatbotSessionId: number;
}
