import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../core/components/header/header';
import { FunerariaService } from '../../services/funeraria.service';
import { Funeraria } from '../../models/funeraria.model';
import { Router } from '@angular/router';

/**
 * FunerariaListComponent - Displays list of funeral homes with ratings
 * Features:
 * - Load all funeral homes
 * - Calculate and display average rating from reviews
 * - Show basic info: name, city, state
 * - Click to view details
 */
@Component({
  selector: 'app-funeraria-list',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="funeraria-list-container">
      <h1>Funerárias Registradas</h1>
      
      <div *ngIf="loading" class="loading">
        Carregando funerárias...
      </div>

      <div *ngIf="!loading && error" class="error-message">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error && funerarias.length === 0" class="no-data">
        Nenhuma funerária encontrada.
      </div>

      <div *ngIf="!loading && funerarias.length > 0" class="funerarias-grid">
        <div *ngFor="let funeraria of funerarias" class="funeraria-card" (click)="viewDetails(funeraria.id)">
          <h3>{{ funeraria.nome }}</h3>
          <p class="location">{{ funeraria.cidade }}, {{ funeraria.estado }}</p>
          <p class="description">{{ funeraria.descricao }}</p>
          <div class="rating">
            <span>{{ getAverageRating(funeraria) }}</span>
            <span class="review-count">({{ funeraria.reviews?.length || 0 }} avaliações)</span>
          </div>
          <p *ngIf="funeraria.servicos && funeraria.servicos.length > 0" class="services">
            {{ funeraria.servicos.length }} serviços oferecidos
          </p>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .funeraria-list-container {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5em;
      color: #333;
    }

    .loading, .error-message, .no-data {
      text-align: center;
      padding: 40px;
      font-size: 1.1em;
      color: #666;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      border-radius: 8px;
      padding: 20px;
    }

    .funerarias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 25px;
    }

    .funeraria-card {
      padding: 25px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .funeraria-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-4px);
    }

    .funeraria-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.3em;
    }

    .location {
      color: #666;
      margin: 8px 0;
      font-size: 0.95em;
    }

    .description {
      color: #777;
      margin: 12px 0;
      font-size: 0.9em;
      line-height: 1.5;
    }

    .rating {
      margin: 15px 0;
      font-size: 1.1em;
    }

    .review-count {
      color: #999;
      font-size: 0.85em;
      margin-left: 8px;
    }

    .services {
      color: #007bff;
      margin: 10px 0 0 0;
      font-size: 0.9em;
      font-weight: bold;
    }
  `]
})
export class FunerariaListComponent implements OnInit {
  funerarias: Funeraria[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private funerariaService: FunerariaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFunerarias();
  }

  loadFunerarias(): void {
    this.funerariaService.getAll().subscribe({
      next: (data) => {
        this.funerarias = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  getAverageRating(funeraria: Funeraria): number {
    return this.funerariaService.getAverageRating(funeraria);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/detalhes', id]);
  }
}
