import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService extends ApiService {
  private endpoint = '/Reviews';

  getAll(): Observable<Review[]> {
    return this.get<Review[]>(this.endpoint);
  }

  getReviewById(id: number): Observable<Review> {
    return this.getById<Review>(this.endpoint, id);
  }

  create(payload: Partial<Review>): Observable<Review> {
    return this.post<Review>(this.endpoint, payload);
  }

  update(id: number, payload: Partial<Review>): Observable<Review> {
    return this.put<Review>(this.endpoint, id, payload);
  }

  deleteReview(id: number): Observable<void> {
    return this.remove<void>(this.endpoint, id);
  }
}
