import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatbotSession } from '../models/chatbot-session.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotSessionService extends ApiService {
  private endpoint = '/ChatbotSessions';

  getAll(): Observable<ChatbotSession[]> {
    return this.get<ChatbotSession[]>(this.endpoint);
  }

  getSessionById(id: number): Observable<ChatbotSession> {
    return this.getById<ChatbotSession>(this.endpoint, id);
  }

  create(payload: Partial<ChatbotSession>): Observable<ChatbotSession> {
    return this.post<ChatbotSession>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<ChatbotSession>): Observable<ChatbotSession> {
    return this.put<ChatbotSession>(this.endpoint, id, payload);
  }

  deleteSession(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }
}
