import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatbotMessage } from '../models/chatbot-message.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotMessageService extends ApiService {
  private endpoint = '/ChatbotMessages';

  getAll(): Observable<ChatbotMessage[]> {
    return this.get<ChatbotMessage[]>(this.endpoint);
  }

  getMessageById(id: number): Observable<ChatbotMessage> {
    return this.getById<ChatbotMessage>(this.endpoint, id);
  }

  create(payload: Partial<ChatbotMessage>): Observable<ChatbotMessage> {
    return this.post<ChatbotMessage>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<ChatbotMessage>): Observable<ChatbotMessage> {
    return this.put<ChatbotMessage>(this.endpoint, id, payload);
  }

  deleteMessage(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }
}
