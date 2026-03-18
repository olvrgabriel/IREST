import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends ApiService {
  private endpoint = '/Usuarios';

  getAll(): Observable<Usuario[]> {
    return this.get<Usuario[]>(this.endpoint);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.getById<Usuario>(this.endpoint, id);
  }

  create(payload: Partial<Usuario>): Observable<Usuario> {
    return this.post<Usuario>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<Usuario>): Observable<Usuario> {
    return this.put<Usuario>(this.endpoint, id, payload);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }
}
