import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'funeraria' | 'usuario';
  token: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface RegisterFunerariaRequest {
  nome: string;
  email: string;
  senha: string;
  cidade: string;
  estado?: string;
  telefone?: string;
  endereco?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredUser(): AuthUser | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private storeUser(user: AuthUser): void {
    localStorage.setItem('authToken', user.token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get isFuneraria(): boolean {
    return this.currentUser?.role === 'funeraria';
  }

  get isUsuario(): boolean {
    return this.currentUser?.role === 'usuario';
  }

  get userId(): number | null {
    return this.currentUser?.id ?? null;
  }

  get userRole(): string | null {
    return this.currentUser?.role ?? null;
  }

  login(request: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/Auth/login`, request).pipe(
      tap(user => this.storeUser(user))
    );
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/Auth/register`, request).pipe(
      tap(user => this.storeUser(user))
    );
  }

  registerFuneraria(request: RegisterFunerariaRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/Auth/register-funeraria`, request).pipe(
      tap(user => this.storeUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
