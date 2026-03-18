import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Servico } from '../models/servico.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ServicoService extends ApiService {
  private endpoint = '/Servicos';

  getAll(): Observable<Servico[]> {
    return this.get<Servico[]>(this.endpoint);
  }

  getServicoById(id: number): Observable<Servico> {
    return this.getById<Servico>(this.endpoint, id);
  }

  create(payload: Partial<Servico>): Observable<Servico> {
    return this.post<Servico>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<Servico>): Observable<Servico> {
    return this.put<Servico>(this.endpoint, id, payload);
  }

  deleteServico(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }
}
