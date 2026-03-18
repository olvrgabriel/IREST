import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Favorito } from '../models/favorito.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService extends ApiService {
  private endpoint = '/Favoritos';

  getAll(): Observable<Favorito[]> {
    return this.get<Favorito[]>(this.endpoint);
  }

  getFavoritoById(id: number): Observable<Favorito> {
    return this.getById<Favorito>(this.endpoint, id);
  }

  create(payload: Partial<Favorito>): Observable<Favorito> {
    return this.post<Favorito>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<Favorito>): Observable<Favorito> {
    return this.put<Favorito>(this.endpoint, id, payload);
  }

  deleteFavorito(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }
}
