import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Funeraria } from '../models/funeraria.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FunerariaService extends ApiService {
  private endpoint = '/Funerarias';

  getAll(): Observable<Funeraria[]> {
    return this.get<Funeraria[]>(this.endpoint);
  }

  getFunerariaById(id: number): Observable<Funeraria> {
    return this.getById<Funeraria>(this.endpoint, id);
  }

  create(payload: Partial<Funeraria>): Observable<Funeraria> {
    return this.post<Funeraria>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<Funeraria>): Observable<Funeraria> {
    return this.put<Funeraria>(this.endpoint, id, payload);
  }

  deleteFuneraria(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }

  getAverageRating(funeraria: Funeraria): number {
    if (!funeraria.reviews || funeraria.reviews.length === 0) {
      return 0;
    }
    const sum = funeraria.reviews.reduce((acc: number, review: any) => acc + (review.nota || 0), 0);
    return Math.round((sum / funeraria.reviews.length) * 10) / 10;
  }
}
