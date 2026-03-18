import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { ChatbotSessionService } from '../../services/chatbot-session.service';
import { ChatbotMessageService } from '../../services/chatbot-message.service';
import { ChatbotSession } from '../../models/chatbot-session.model';
import { ChatbotMessage } from '../../models/chatbot-message.model';

/**
 * ChatSessionComponent - Display and manage chatbot session messages
 * Features:
 * - Load existing chat session or create new one
 * - Display messages between user and bot
 * - Send new messages
 * - Real-time message updates
 */
@Component({
  selector: 'app-chat-session',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="chat-session-container">
      <div class="chat-header">
        <h2>Chat de Ajuda IREST</h2>
      </div>

      <div *ngIf="loading" class="loading">
        Carregando chat...
      </div>

      <div *ngIf="!loading" class="chat-box">
        <div class="messages-container">
          <div *ngFor="let message of messages" 
               [ngClass]="{'user-message': isUserMessage(message), 'bot-message': !isUserMessage(message)}"
               class="message">
            <p>{{ message.mensagem }}</p>
            <span class="timestamp">{{ message.dataEnvio | date:'short' }}</span>
          </div>

          <div *ngIf="messages.length === 0" class="no-messages">
            Comece uma conversa enviando uma mensagem!
          </div>
        </div>

        <div class="input-area">
          <input 
            type="text" 
            [(ngModel)]="newMessage" 
            placeholder="Digite sua mensagem..."
            (keyup.enter)="sendMessage()"
            class="message-input">
          <button (click)="sendMessage()" [disabled]="!newMessage.trim() || sendingMessage" class="send-btn">
            {{ sendingMessage ? '...' : 'Enviar' }}
          </button>
        </div>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </main>
  `,
  styles: [`
    .chat-session-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
      height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
    }

    .chat-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }

    .chat-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.8em;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .chat-box {
      display: flex;
      flex-direction: column;
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fff;
      overflow: hidden;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .no-messages {
      text-align: center;
      color: #999;
      padding: 40px 20px;
    }

    .message {
      display: flex;
      flex-direction: column;
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 8px;
      word-wrap: break-word;
    }

    .message p {
      margin: 0 0 8px 0;
      line-height: 1.5;
    }

    .timestamp {
      font-size: 0.75em;
      opacity: 0.7;
    }

    .user-message {
      align-self: flex-end;
      background-color: #007bff;
      color: white;
    }

    .bot-message {
      align-self: flex-start;
      background-color: #e8f4f8;
      color: #333;
    }

    .input-area {
      display: flex;
      gap: 10px;
      padding: 15px;
      border-top: 1px solid #ddd;
      background-color: #f9f9f9;
    }

    .message-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1em;
      outline: none;
    }

    .message-input:focus {
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    }

    .send-btn {
      padding: 12px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .send-btn:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .send-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 15px;
      text-align: center;
      border-top: 1px solid #ddd;
    }
  `]
})
export class ChatSessionComponent implements OnInit {
  sessionId: number = 0;
  messages: ChatbotMessage[] = [];
  newMessage: string = '';
  loading = true;
  sendingMessage = false;
  error: string | null = null;

  constructor(
    private chatSessionService: ChatbotSessionService,
    private chatMessageService: ChatbotMessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['sessionId']) {
        this.sessionId = Number(params['sessionId']);
        this.loadSession();
      } else {
        this.createNewSession();
      }
    });
  }

  loadSession(): void {
    this.chatSessionService.getSessionById(this.sessionId).subscribe({
      next: (session: ChatbotSession) => {
        this.messages = session.mensagens || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  createNewSession(): void {
    const userId = Number(localStorage.getItem('userId')) || 1;

    this.chatSessionService.create({ usuarioId: userId }).subscribe({
      next: (session) => {
        this.sessionId = session.id;
        this.messages = [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.sessionId) {
      return;
    }

    this.sendingMessage = true;
    const userMessage: Omit<ChatbotMessage, 'id' | 'dataEnvio'> = {
      mensagem: this.newMessage,
      remetente: 'usuario',
      chatbotSessionId: this.sessionId
    };

    this.chatMessageService.create(userMessage).subscribe({
      next: (response) => {
        // Add user message to list
        this.messages.push(response);
        this.newMessage = '';
        this.sendingMessage = false;

        // Simulate bot response
        setTimeout(() => {
          this.simulateBotResponse();
        }, 500);
      },
      error: (err) => {
        this.error = err.message;
        this.sendingMessage = false;
      }
    });
  }

  simulateBotResponse(): void {
    const botResponse: Omit<ChatbotMessage, 'id' | 'dataEnvio'> = {
      mensagem: 'Obrigado pela sua mensagem! Um agente responderá em breve.',
      remetente: 'bot',
      chatbotSessionId: this.sessionId
    };

    this.chatMessageService.create(botResponse).subscribe({
      next: (response) => {
        this.messages.push(response);
      },
      error: (err) => {
        console.error('Erro ao enviar resposta do bot:', err);
      }
    });
  }

  isUserMessage(message: ChatbotMessage): boolean {
    return message.remetente === 'usuario';
  }
}
