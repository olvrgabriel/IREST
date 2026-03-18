import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FunerariaService } from '../../services/funeraria.service';
import { Funeraria } from '../../models/funeraria.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults implements OnInit {
  funerarias: Funeraria[] = [];
  loading = true;
  error: string | null = null;

  constructor(private funerariaService: FunerariaService) {}

  ngOnInit(): void {
    this.loadFunerarias();
  }

  loadFunerarias(): void {
    this.loading = true;
    this.funerariaService.getAll().subscribe({
      next: (data) => {
        this.funerarias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar funerárias:', err);
        this.error = err.message || 'Erro ao carregar dados';
        this.loading = false;
      }
    });
  }

  getAverageRating(funeraria: Funeraria): number {
    if (!funeraria.reviews || funeraria.reviews.length === 0) return 0;
    const sum = funeraria.reviews.reduce((acc, review) => acc + review.nota, 0);
    return Math.round((sum / funeraria.reviews.length) * 10) / 10;
  }

  getMinPrice(funeraria: Funeraria): number {
    if (!funeraria.servicos || funeraria.servicos.length === 0) return 0;
    return Math.min(...funeraria.servicos.map(s => s.preco));
  }
}
