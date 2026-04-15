import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';

/**
 * ReviewCreateComponent - Form to create a new review for a funeral home
 * Features:
 * - Select rating from 1-5 stars
 * - Enter title and comment
 * - Submit review to API
 * - Handle errors and success messages
 */
@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, RouterModule],
  template: `
    <app-header></app-header>
    <main class="review-create-container">
      <h1>Deixar Avaliação</h1>

      <form (ngSubmit)="submitReview()" class="review-form">
        <div class="form-group">
          <label for="funerariaId">ID da Funerária *</label>
          <input 
            type="text" 
            id="funerariaId" 
            [(ngModel)]="form.funerariaId" 
            name="funerariaId"
            placeholder="ID da funerária"
            required>
        </div>

        <div class="form-group">
          <label for="usuarioId">ID do Usuário *</label>
          <input 
            type="text" 
            id="usuarioId" 
            [(ngModel)]="form.usuarioId" 
            name="usuarioId"
            placeholder="ID do usuário"
            required>
        </div>

        <div class="form-group">
          <label>Classificação (⭐) *</label>
          <div class="star-rating">
            <input 
              type="radio" 
              name="nota" 
              value="1" 
              [(ngModel)]="form.nota"
              id="star1">
            <label for="star1" class="star">⭐</label>

            <input 
              type="radio" 
              name="nota" 
              value="2" 
              [(ngModel)]="form.nota"
              id="star2">
            <label for="star2" class="star">⭐⭐</label>

            <input 
              type="radio" 
              name="nota" 
              value="3" 
              [(ngModel)]="form.nota"
              id="star3">
            <label for="star3" class="star">⭐⭐⭐</label>

            <input 
              type="radio" 
              name="nota" 
              value="4" 
              [(ngModel)]="form.nota"
              id="star4">
            <label for="star4" class="star">⭐⭐⭐⭐</label>

            <input 
              type="radio" 
              name="nota" 
              value="5" 
              [(ngModel)]="form.nota"
              id="star5"
              checked>
            <label for="star5" class="star">⭐⭐⭐⭐⭐</label>
          </div>
        </div>

        <div class="form-group">
          <label for="comentario">Comentário *</label>
          <textarea 
            id="comentario" 
            [(ngModel)]="form.comentario" 
            name="comentario"
            placeholder="Descreva sua experiência..."
            rows="6"
            required></textarea>
        </div>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <div *ngIf="success" class="success-message">
          Avaliação enviada com sucesso!
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="loading" class="btn-submit">
            {{ loading ? 'Enviando...' : 'Enviar Avaliação' }}
          </button>
          <a routerLink="/busca" class="btn-cancel">Cancelar</a>
        </div>
      </form>
    </main>
  `,
  styles: [`
    .review-create-container {
      padding: 40px 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      margin-bottom: 40px;
      color: #333;
      font-size: 2em;
    }

    .review-form {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .form-group {
      margin-bottom: 25px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #333;
    }

    input[type="text"],
    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 1em;
    }

    input[type="text"]:focus,
    textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    }

    textarea {
      resize: vertical;
    }

    .star-rating {
      display: flex;
      gap: 8px;
    }

    .star-rating input[type="radio"] {
      display: none;
    }

    .star-rating .star {
      font-size: 2em;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
      margin: 0;
    }

    .star-rating input[type="radio"]:checked ~ .star,
    .star-rating .star:hover {
      opacity: 1;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn-submit,
    .btn-cancel {
      padding: 12px 30px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 1em;
      font-weight: bold;
      text-decoration: none;
      text-align: center;
      transition: all 0.3s ease;
    }

    .btn-submit {
      background-color: #28a745;
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn-submit:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: white;
      display: inline-block;
    }

    .btn-cancel:hover {
      background-color: #5a6268;
    }
  `]
})
export class ReviewCreateComponent implements OnInit {
  form = {
    funerariaId: 0,
    usuarioId: 1,
    nota: 5,
    comentario: ''
  };

  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Try to get funerariaId from route params
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.form.funerariaId = Number(params['id']);
      }
    });
  }

  submitReview(): void {
    if (!this.form.funerariaId || !this.form.usuarioId || !this.form.comentario) {
      this.error = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload = {
      nota: Number(this.form.nota),
      comentario: this.form.comentario,
      funerariaId: Number(this.form.funerariaId),
      usuarioId: Number(this.form.usuarioId)
    };

    this.reviewService.create(payload).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/busca']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
