import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/components/header/header';
import { ChatbotService, ChatHistoryItem } from '../../services/chatbot.service';
import { timeout } from 'rxjs/operators';

interface ChatMessage {
  text: string;
  sender: 'bot' | 'user';
}

@Component({
  selector: 'app-help-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './help-chat.html',
  styleUrl: './help-chat.css',
})
export class HelpChat {
  @ViewChild('chatArea') chatArea!: ElementRef;

  userInput = '';
  isLoading = false;

  messages: ChatMessage[] = [
    { text: 'Olá! Sou o assistente virtual da IREST. Como posso ajudá-lo hoje?', sender: 'bot' },
  ];

  suggestions: string[] = [
    'Como funciona a plataforma?',
    'Como avaliar uma funerária?',
    'Preciso de ajuda urgente',
    'Valores dos serviços',
    'Documentação necessária',
  ];

  constructor(
    private chatbotService: ChatbotService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ text, sender: 'user' });
    this.userInput = '';
    this.scrollToBottom();
    this.callAI(text);
  }

  sendSuggestion(suggestion: string): void {
    if (this.isLoading) return;
    this.messages.push({ text: suggestion, sender: 'user' });
    this.scrollToBottom();
    this.callAI(suggestion);
  }

  private callAI(mensagem: string): void {
    this.isLoading = true;
    this.scrollToBottom();

    // Monta histórico (exclui a última mensagem do user que já adicionamos)
    const historico: ChatHistoryItem[] = this.messages
      .slice(0, -1) // exclui última mensagem (user atual)
      .map(m => ({ remetente: m.sender === 'user' ? 'user' : 'bot', texto: m.text }));

    console.log('[Chat] Enviando mensagem:', mensagem);
    this.chatbotService.sendMessage(mensagem, historico)
      .pipe(timeout(45000))
      .subscribe({
        next: (res) => {
          console.log('[Chat] Resposta recebida:', res);
          this.zone.run(() => {
            const resposta = (res as any)?.resposta || (res as any)?.Resposta || 'Não recebi uma resposta. Tente novamente.';
            // Update imutavel para garantir change detection
            this.messages = [...this.messages, { text: resposta, sender: 'bot' }];
            this.isLoading = false;
            this.cdr.detectChanges();
            this.scrollToBottom();
          });
        },
        error: (err) => {
          console.error('[Chat] Erro:', err);
          this.zone.run(() => {
            let msg: string;
            if (err?.name === 'TimeoutError') {
              msg = 'A resposta demorou demais. Tente novamente em alguns instantes.';
            } else if (err?.error?.resposta && err.error.resposta.includes('não está configurado')) {
              msg = 'O assistente de IA está temporariamente indisponivel. Por favor, tente novamente mais tarde.';
            } else if (err?.status === 401) {
              msg = 'Voce precisa estar logado para usar o chat.';
            } else {
              msg = 'Desculpe, o assistente de IA esta temporariamente indisponivel. Tente novamente mais tarde.';
            }
            this.messages = [...this.messages, { text: msg, sender: 'bot' }];
            this.isLoading = false;
            this.cdr.detectChanges();
            this.scrollToBottom();
          });
        }
      });
  }

  /**
   * Converte um subconjunto seguro de Markdown (negrito, listas, parágrafos)
   * para HTML. O HTML é escapado antes, e o binding [innerHTML] do Angular
   * sanitiza o resultado — então não há risco de injeção.
   */
  formatMessage(text: string): string {
    if (!text) return '';

    // 1) Escapa HTML para evitar injeção de tags vindas do modelo
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2) Negrito **texto**
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // 3) Monta blocos linha a linha (parágrafos, listas com - / *, listas numeradas)
    const lines = safe.split('\n');
    let html = '';
    let listType: 'ul' | 'ol' | null = null;
    const closeList = () => {
      if (listType) { html += `</${listType}>`; listType = null; }
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { closeList(); continue; }

      const heading = /^#{1,6}\s+(.*)$/.exec(line);
      const bullet = /^[-*]\s+(.*)$/.exec(line);
      const numbered = /^\d+\.\s+(.*)$/.exec(line);

      if (heading) {
        closeList();
        html += `<p><strong>${heading[1]}</strong></p>`;
      } else if (bullet) {
        if (listType !== 'ul') { closeList(); html += '<ul>'; listType = 'ul'; }
        html += `<li>${bullet[1]}</li>`;
      } else if (numbered) {
        if (listType !== 'ol') { closeList(); html += '<ol>'; listType = 'ol'; }
        html += `<li>${numbered[1]}</li>`;
      } else {
        closeList();
        html += `<p>${line}</p>`;
      }
    }
    closeList();
    return html;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatArea) {
        this.chatArea.nativeElement.scrollTop =
          this.chatArea.nativeElement.scrollHeight;
      }
    }, 0);
  }
}
