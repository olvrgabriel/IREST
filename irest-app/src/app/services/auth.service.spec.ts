import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve iniciar deslogado', () => {
    expect(service.isLoggedIn).toBe(false);
    expect(service.currentUser).toBeNull();
  });

  it('deve retornar isAdmin false quando não logado', () => {
    expect(service.isAdmin).toBe(false);
  });

  it('deve retornar isFuneraria false quando não logado', () => {
    expect(service.isFuneraria).toBe(false);
  });

  it('deve retornar isUsuario false quando não logado', () => {
    expect(service.isUsuario).toBe(false);
  });

  it('deve retornar userId null quando não logado', () => {
    expect(service.userId).toBeNull();
  });

  it('deve fazer login e armazenar o usuário', () => {
    const mockResponse = {
      token: 'fake-jwt-token',
      id: 1,
      nome: 'Teste',
      email: 'teste@teste.com',
      role: 'usuario' as const
    };

    service.login({ email: 'teste@teste.com', senha: '123456' }).subscribe(user => {
      expect(user.token).toBe('fake-jwt-token');
      expect(user.nome).toBe('Teste');
      expect(user.role).toBe('usuario');
    });

    const req = httpMock.expectOne('http://localhost:5019/api/Auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'teste@teste.com', senha: '123456' });
    req.flush(mockResponse);

    expect(service.isLoggedIn).toBe(true);
    expect(service.isUsuario).toBe(true);
    expect(service.userId).toBe(1);
    expect(localStorage.getItem('authToken')).toBe('fake-jwt-token');
  });

  it('deve identificar role admin corretamente', () => {
    const mockResponse = {
      token: 'admin-token',
      id: 1,
      nome: 'Admin',
      email: 'admin@irest.com',
      role: 'admin' as const
    };

    service.login({ email: 'admin@irest.com', senha: 'admin' }).subscribe();

    const req = httpMock.expectOne('http://localhost:5019/api/Auth/login');
    req.flush(mockResponse);

    expect(service.isAdmin).toBe(true);
    expect(service.isFuneraria).toBe(false);
    expect(service.isUsuario).toBe(false);
  });

  it('deve identificar role funeraria corretamente', () => {
    const mockResponse = {
      token: 'funeraria-token',
      id: 2,
      nome: 'Funerária Central',
      email: 'fun@irest.com',
      role: 'funeraria' as const
    };

    service.login({ email: 'fun@irest.com', senha: '123' }).subscribe();

    const req = httpMock.expectOne('http://localhost:5019/api/Auth/login');
    req.flush(mockResponse);

    expect(service.isFuneraria).toBe(true);
    expect(service.isAdmin).toBe(false);
    expect(service.isUsuario).toBe(false);
  });

  it('deve registrar usuário e armazenar token', () => {
    const mockResponse = {
      token: 'new-user-token',
      id: 5,
      nome: 'Novo Usuário',
      email: 'novo@teste.com',
      role: 'usuario' as const
    };

    service.register({ nome: 'Novo Usuário', email: 'novo@teste.com', senha: '123456' }).subscribe(user => {
      expect(user.id).toBe(5);
    });

    const req = httpMock.expectOne('http://localhost:5019/api/Auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.isLoggedIn).toBe(true);
  });

  it('deve registrar funerária e armazenar token', () => {
    const mockResponse = {
      token: 'fun-token',
      id: 3,
      nome: 'Funerária Nova',
      email: 'nova@fun.com',
      role: 'funeraria' as const
    };

    service.registerFuneraria({
      nome: 'Funerária Nova',
      email: 'nova@fun.com',
      senha: '123456',
      cidade: 'São Paulo'
    }).subscribe();

    const req = httpMock.expectOne('http://localhost:5019/api/Auth/register-funeraria');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.isFuneraria).toBe(true);
  });

  it('deve fazer logout e limpar dados', () => {
    // Simula login
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('currentUser', JSON.stringify({ id: 1, nome: 'Teste', email: 'a@a.com', role: 'usuario', token: 'fake-token' }));

    // Recria o service para ler do localStorage
    const freshService = new AuthService(TestBed.inject(AuthService)['http']);

    freshService.logout();

    expect(freshService.isLoggedIn).toBe(false);
    expect(freshService.currentUser).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('deve restaurar sessão do localStorage', () => {
    const storedUser = { id: 1, nome: 'Persistido', email: 'p@p.com', role: 'usuario', token: 'stored-token' };
    localStorage.setItem('currentUser', JSON.stringify(storedUser));

    // Recria o service
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService]
    });

    const freshService = TestBed.inject(AuthService);
    expect(freshService.isLoggedIn).toBe(true);
    expect(freshService.currentUser?.nome).toBe('Persistido');
  });
});
