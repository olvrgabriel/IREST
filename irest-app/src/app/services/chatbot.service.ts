import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatHistoryItem {
  remetente: 'user' | 'bot';
  texto: string;
}

export interface ChatbotRequest {
  mensagem: string;
  historico: ChatHistoryItem[];
}

export interface ChatbotApiResponse {
  resposta: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(mensagem: string, historico: ChatHistoryItem[]): Observable<ChatbotApiResponse> {
    const body: ChatbotRequest = { mensagem, historico };
    return this.http.post<ChatbotApiResponse>(`${this.baseUrl}/Chatbot/message`, body);
  }
}
