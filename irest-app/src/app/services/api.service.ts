import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro ao processar sua requisicao';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message ||
                     error.error?.error ||
                     `Erro do servidor: ${error.status} - ${error.statusText}`;
    }

    console.error('API Error:', errorMessage);
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
    return this.http.put<T>(`${this.baseUrl}${endpoint}/${id}`, payload).pipe(
      catchError(error => this.handleError(error))
    );
  }

  protected remove<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
