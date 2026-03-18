import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Admin } from '../models/admin.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends ApiService {
  private endpoint = '/Admins';

  getAll(): Observable<Admin[]> {
    return this.get<Admin[]>(this.endpoint);
  }

  getAdminById(id: number): Observable<Admin> {
    return this.getById<Admin>(this.endpoint, id);
  }

  create(payload: Partial<Admin>): Observable<Admin> {
    return this.post<Admin>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<Admin>): Observable<Admin> {
    return this.put<Admin>(this.endpoint, id, payload);
  }

  deleteAdmin(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }
}
