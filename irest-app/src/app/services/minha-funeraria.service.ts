import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Funeraria } from '../models/funeraria.model';
import { Servico } from '../models/servico.model';
import { Review } from '../models/review.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MinhaFunerariaService extends ApiService {
  private endpoint = '/MinhaFuneraria';

  getMyFuneraria(): Observable<Funeraria> {
    return this.get<Funeraria>(this.endpoint);
  }

  updateMyFuneraria(payload: Partial<Funeraria>): Observable<any> {
    return this.http.put(`${this.baseUrl}${this.endpoint}`, payload, { responseType: 'text' });
  }

  getMyServicos(): Observable<Servico[]> {
    return this.get<Servico[]>(`${this.endpoint}/servicos`);
  }

  createServico(payload: Partial<Servico>): Observable<Servico> {
    return this.post<Servico>(`${this.endpoint}/servicos`, payload);
  }

  updateServico(id: number, payload: Partial<Servico>): Observable<any> {
    return this.http.put(`${this.baseUrl}${this.endpoint}/servicos/${id}`, payload, { responseType: 'text' });
  }

  deleteServico(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${this.endpoint}/servicos/${id}`, { responseType: 'text' });
  }

  getMyReviews(): Observable<Review[]> {
    return this.get<Review[]>(`${this.endpoint}/reviews`);
  }
}
