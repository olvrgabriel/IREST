import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * HTTP Interceptor to add Authorization header with Bearer token
 * Retrieves token from localStorage if available
 * Usage: Include in providers array in app.config or AppModule
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Intercept all HTTP requests and add Authorization header if token exists
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    // Only add authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
