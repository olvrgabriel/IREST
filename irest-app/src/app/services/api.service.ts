import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro ao processar sua requisição';

    if (error.status === 0) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em ' + this.baseUrl;
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message ||
                     error.error?.title ||
                     `Erro do servidor: ${error.status} - ${error.statusText}`;
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  protected getById<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  protected post<T>(endpoint: string, payload: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, payload).pipe(
      catchError(error => this.handleError(error))
    );
  }

  protected put<T>(endpoint: string, id: number | string, payload: any): Observable<T> {
    return this.http.put(`${this.baseUrl}${endpoint}/${id}`, payload, { responseType: 'text' }).pipe(
      map(body => (body ? JSON.parse(body) : null) as T),
      catchError(error => this.handleError(error))
    );
  }

  protected remove<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete(`${this.baseUrl}${endpoint}/${id}`, { responseType: 'text' }).pipe(
      map(body => (body ? JSON.parse(body) : null) as T),
      catchError(error => this.handleError(error))
    );
  }
}
