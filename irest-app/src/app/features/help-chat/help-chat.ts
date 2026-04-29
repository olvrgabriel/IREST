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
            const msg = err?.name === 'TimeoutError'
              ? 'A resposta demorou demais. Tente novamente em alguns instantes.'
              : 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
            this.messages = [...this.messages, { text: msg, sender: 'bot' }];
            this.isLoading = false;
            this.cdr.detectChanges();
            this.scrollToBottom();
          });
        }
      });
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
