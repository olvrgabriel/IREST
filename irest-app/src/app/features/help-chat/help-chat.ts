import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/components/header/header';

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

  messages: ChatMessage[] = [
    { text: 'Olá! Como posso ajudá-lo hoje?', sender: 'bot' },
  ];

  suggestions: string[] = [
    'Como funciona a plataforma?',
    'Como avaliar uma funerária?',
    'Preciso de ajuda urgente',
    'Valores dos serviços',
    'Documentação necessária',
  ];

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text) return;

    this.messages.push({ text, sender: 'user' });
    this.userInput = '';
    this.scrollToBottom();

    setTimeout(() => {
      this.messages.push({ text: this.getBotResponse(text), sender: 'bot' });
      this.scrollToBottom();
    }, 600);
  }

  sendSuggestion(suggestion: string): void {
    this.messages.push({ text: suggestion, sender: 'user' });
    this.scrollToBottom();

    setTimeout(() => {
      this.messages.push({
        text: this.getBotResponse(suggestion),
        sender: 'bot',
      });
      this.scrollToBottom();
    }, 600);
  }

  private getBotResponse(input: string): string {
    const lower = input.toLowerCase();

    if (lower.includes('plataforma') || lower.includes('funciona')) {
      return 'A plataforma IREST conecta famílias a funerárias avaliadas por outros usuários. Você pode buscar, comparar preços e ver avaliações antes de tomar uma decisão.';
    }

    if (lower.includes('avaliar') || lower.includes('avaliação')) {
      return 'Para avaliar uma funerária, acesse a página dela e clique em "Avaliar". Você pode dar uma nota de 1 a 5 ⭐ e deixar um comentário sobre sua experiência.';
    }

    if (lower.includes('urgente') || lower.includes('emergência')) {
      return 'Se você precisa de ajuda urgente, recomendamos ligar diretamente para uma funerária próxima. Use a busca por localização para encontrar opções perto de você.';
    }

    if (lower.includes('valores') || lower.includes('preço') || lower.includes('custo')) {
      return 'Os valores dos serviços variam conforme a funerária e o tipo de serviço. Você pode comparar preços diretamente na página de cada funerária cadastrada na plataforma.';
    }

    if (lower.includes('documentação') || lower.includes('documento')) {
      return 'Geralmente são necessários: certidão de óbito, documento de identidade do falecido e do responsável, e comprovante de residência. A funerária pode orientar sobre documentos adicionais.';
    }

    return 'Obrigado pela sua mensagem! Posso ajudá-lo com informações sobre a plataforma, avaliações, valores ou documentação necessária. Como posso ajudar?';
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
