import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { authGuard, adminGuard, funerariaGuard, usuarioGuard } from './auth.guard';

describe('Auth Guards', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===== authGuard =====

  describe('authGuard', () => {
    it('deve bloquear e redirecionar para /login quando não logado', () => {
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('deve permitir acesso quando logado', () => {
      simulaLogin('usuario');
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });

  // ===== adminGuard =====

  describe('adminGuard', () => {
    it('deve bloquear usuário comum', () => {
      simulaLogin('usuario');
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('deve bloquear funerária', () => {
      simulaLogin('funeraria');
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(false);
    });

    it('deve permitir admin', () => {
      simulaLogin('admin');
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });

  // ===== funerariaGuard =====

  describe('funerariaGuard', () => {
    it('deve bloquear usuário comum', () => {
      simulaLogin('usuario');
      const result = TestBed.runInInjectionContext(() => funerariaGuard({} as any, {} as any));
      expect(result).toBe(false);
    });

    it('deve permitir funerária', () => {
      simulaLogin('funeraria');
      const result = TestBed.runInInjectionContext(() => funerariaGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });

  // ===== usuarioGuard =====

  describe('usuarioGuard', () => {
    it('deve bloquear funerária', () => {
      simulaLogin('funeraria');
      const result = TestBed.runInInjectionContext(() => usuarioGuard({} as any, {} as any));
      expect(result).toBe(false);
    });

    it('deve permitir usuário', () => {
      simulaLogin('usuario');
      const result = TestBed.runInInjectionContext(() => usuarioGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('deve bloquear não logado', () => {
      const result = TestBed.runInInjectionContext(() => usuarioGuard({} as any, {} as any));
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  function simulaLogin(role: 'admin' | 'funeraria' | 'usuario') {
    const user = { id: 1, nome: 'Teste', email: 'test@test.com', role, token: 'fake-token' };
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', 'fake-token');
    // Recria o service para ler localStorage
    (authService as any).currentUserSubject.next(user);
  }
});
