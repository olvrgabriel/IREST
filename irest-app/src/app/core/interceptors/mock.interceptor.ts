import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

/**
 * Mock Interceptor - Simula respostas da API para testes locais
 * Armazena dados em localStorage para persistência durante a sessão
 */
@Injectable()
export class MockInterceptor implements HttpInterceptor {
  private storageKey = 'mockApiData';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    if (!localStorage.getItem(this.storageKey)) {
      const mockData = {
        admins: [
          { id: '1', nome: 'Admin Principal', email: 'admin@irest.com' }
        ],
        usuarios: [
          { id: '1', nome: 'João Silva', email: 'joao@example.com', dataCadastro: new Date().toISOString(), reviews: [], favoritos: [], sessoes: [] }
        ],
        funerarias: [
          { id: '1', nome: 'Funerária Central', descricao: 'Serviços funerários completos', cidade: 'São Paulo', estado: 'SP', latitude: -23.5505, longitude: -46.6333, reviews: [], servicos: [], favoritos: [] }
        ],
        reviews: [],
        servicos: [],
        favoritos: [],
        chatbotSessions: [],
        chatbotMessages: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(mockData));
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiUrl = 'http://localhost:5019/api';

    if (!req.url.startsWith(apiUrl)) {
      return next.handle(req);
    }

    const path = req.url.replace(apiUrl, '');
    const method = req.method;

    // Simular delay de rede e processar a requisição
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        try {
          const response = this.handleRequest(method, path, req.body);
          return of(new HttpResponse({ status: 200, body: response }));
        } catch (error) {
          return throwError(() => new Error('Erro ao processar requisição'));
        }
      })
    );
  }

  private handleRequest(method: string, path: string, body: any): any {
    const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');

    // GET /admins
    if (method === 'GET' && path === '/admins') {
      return data.admins || [];
    }

    // GET /admins/{id}
    if (method === 'GET' && path.match(/^\/admins\/[^/]+$/)) {
      const id = path.split('/').pop();
      return data.admins?.find((a: any) => a.id === id) || {};
    }

    // POST /admins
    if (method === 'POST' && path === '/admins') {
      const newAdmin = { id: Date.now().toString(), ...body };
      data.admins.push(newAdmin);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newAdmin;
    }

    // PUT /admins/{id}
    if (method === 'PUT' && path.match(/^\/admins\/[^/]+$/)) {
      const id = path.split('/').pop();
      const index = data.admins?.findIndex((a: any) => a.id === id) ?? -1;
      if (index >= 0) {
        data.admins[index] = { id, ...body };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data.admins[index];
      }
      return {};
    }

    // DELETE /admins/{id}
    if (method === 'DELETE' && path.match(/^\/admins\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.admins = data.admins?.filter((a: any) => a.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    // ===== USUARIOS =====
    if (method === 'GET' && path === '/usuarios') {
      return data.usuarios || [];
    }

    if (method === 'GET' && path.match(/^\/usuarios\/[^/]+$/)) {
      const id = path.split('/').pop();
      return data.usuarios?.find((u: any) => u.id === id) || {};
    }

    if (method === 'POST' && path === '/usuarios') {
      const newUsuario = { id: Date.now().toString(), ...body };
      data.usuarios.push(newUsuario);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newUsuario;
    }

    if (method === 'PUT' && path.match(/^\/usuarios\/[^/]+$/)) {
      const id = path.split('/').pop();
      const index = data.usuarios?.findIndex((u: any) => u.id === id) ?? -1;
      if (index >= 0) {
        data.usuarios[index] = { id, ...body };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data.usuarios[index];
      }
      return {};
    }

    if (method === 'DELETE' && path.match(/^\/usuarios\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.usuarios = data.usuarios?.filter((u: any) => u.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    // ===== FUNERARIAS =====
    if (method === 'GET' && path === '/funerarias') {
      return data.funerarias || [];
    }

    if (method === 'GET' && path.match(/^\/funerarias\/[^/]+$/)) {
      const id = path.split('/').pop();
      return data.funerarias?.find((f: any) => f.id === id) || {};
    }

    if (method === 'POST' && path === '/funerarias') {
      const newFuneraria = { id: Date.now().toString(), ...body };
      data.funerarias.push(newFuneraria);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newFuneraria;
    }

    if (method === 'PUT' && path.match(/^\/funerarias\/[^/]+$/)) {
      const id = path.split('/').pop();
      const index = data.funerarias?.findIndex((f: any) => f.id === id) ?? -1;
      if (index >= 0) {
        data.funerarias[index] = { id, ...body };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data.funerarias[index];
      }
      return {};
    }

    if (method === 'DELETE' && path.match(/^\/funerarias\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.funerarias = data.funerarias?.filter((f: any) => f.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    // ===== REVIEWS =====
    if (method === 'GET' && path === '/reviews') {
      return data.reviews || [];
    }

    if (method === 'GET' && path.match(/^\/reviews\/[^/]+$/)) {
      const id = path.split('/').pop();
      return data.reviews?.find((r: any) => r.id === id) || {};
    }

    if (method === 'POST' && path === '/reviews') {
      const newReview = { id: Date.now().toString(), ...body };
      data.reviews.push(newReview);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newReview;
    }

    if (method === 'PUT' && path.match(/^\/reviews\/[^/]+$/)) {
      const id = path.split('/').pop();
      const index = data.reviews?.findIndex((r: any) => r.id === id) ?? -1;
      if (index >= 0) {
        data.reviews[index] = { id, ...body };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data.reviews[index];
      }
      return {};
    }

    if (method === 'DELETE' && path.match(/^\/reviews\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.reviews = data.reviews?.filter((r: any) => r.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    // ===== SERVICOS =====
    if (method === 'GET' && path === '/servicos') {
      return data.servicos || [];
    }

    if (method === 'GET' && path.match(/^\/servicos\/[^/]+$/)) {
      const id = path.split('/').pop();
      return data.servicos?.find((s: any) => s.id === id) || {};
    }

    if (method === 'POST' && path === '/servicos') {
      const newServico = { id: Date.now().toString(), ...body };
      data.servicos.push(newServico);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newServico;
    }

    if (method === 'PUT' && path.match(/^\/servicos\/[^/]+$/)) {
      const id = path.split('/').pop();
      const index = data.servicos?.findIndex((s: any) => s.id === id) ?? -1;
      if (index >= 0) {
        data.servicos[index] = { id, ...body };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data.servicos[index];
      }
      return {};
    }

    if (method === 'DELETE' && path.match(/^\/servicos\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.servicos = data.servicos?.filter((s: any) => s.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    // ===== FAVORITOS =====
    if (method === 'GET' && path === '/favoritos') {
      return data.favoritos || [];
    }

    if (method === 'GET' && path.match(/^\/favoritos\/[^/]+$/)) {
      const id = path.split('/').pop();
      return data.favoritos?.find((f: any) => f.id === id) || {};
    }

    if (method === 'POST' && path === '/favoritos') {
      const newFavorito = { id: Date.now().toString(), ...body };
      data.favoritos.push(newFavorito);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newFavorito;
    }

    if (method === 'PUT' && path.match(/^\/favoritos\/[^/]+$/)) {
      const id = path.split('/').pop();
      const index = data.favoritos?.findIndex((f: any) => f.id === id) ?? -1;
      if (index >= 0) {
        data.favoritos[index] = { id, ...body };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data.favoritos[index];
      }
      return {};
    }

    if (method === 'DELETE' && path.match(/^\/favoritos\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.favoritos = data.favoritos?.filter((f: any) => f.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    // ===== CHATBOT SESSIONS =====
    if (method === 'GET' && path === '/chatbotSessions') {
      return data.chatbotSessions || [];
    }

    if (method === 'GET' && path.match(/^\/chatbotSessions\/[^/]+$/)) {
      const id = path.split('/').pop();
      return data.chatbotSessions?.find((s: any) => s.id === id) || {};
    }

    if (method === 'POST' && path === '/chatbotSessions') {
      const newSession = { id: Date.now().toString(), ...body };
      data.chatbotSessions.push(newSession);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newSession;
    }

    if (method === 'PUT' && path.match(/^\/chatbotSessions\/[^/]+$/)) {
      const id = path.split('/').pop();
      const index = data.chatbotSessions?.findIndex((s: any) => s.id === id) ?? -1;
      if (index >= 0) {
        data.chatbotSessions[index] = { id, ...body };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return data.chatbotSessions[index];
      }
      return {};
    }

    if (method === 'DELETE' && path.match(/^\/chatbotSessions\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.chatbotSessions = data.chatbotSessions?.filter((s: any) => s.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    // ===== CHATBOT MESSAGES =====
    if (method === 'GET' && path === '/chatbotMessages') {
      return data.chatbotMessages || [];
    }

    if (method === 'POST' && path === '/chatbotMessages') {
      const newMessage = { id: Date.now().toString(), ...body };
      data.chatbotMessages.push(newMessage);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return newMessage;
    }

    if (method === 'DELETE' && path.match(/^\/chatbotMessages\/[^/]+$/)) {
      const id = path.split('/').pop();
      data.chatbotMessages = data.chatbotMessages?.filter((m: any) => m.id !== id) || [];
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return {};
    }

    return {};
  }
}
