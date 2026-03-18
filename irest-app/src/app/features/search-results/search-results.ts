import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FunerariaService } from '../../services/funeraria.service';
import { Funeraria } from '../../models/funeraria.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults implements OnInit {
  allFunerarias: Funeraria[] = [];
  funerarias: Funeraria[] = [];
  error: string | null = null;

  // Filtros
  searchText = '';
  precoMin: number | null = null;
  precoMax: number | null = null;
  minRating: number = 0;

  constructor(
    private funerariaService: FunerariaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFunerarias();
  }

  loadFunerarias(): void {
    this.error = null;
    this.funerariaService.getAll().subscribe({
      next: (data) => {
        this.allFunerarias = data;
        this.funerarias = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar funerarias:', err);
        this.error = 'Erro ao carregar funerarias. Verifique se o backend esta rodando.';
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.allFunerarias];

    if (this.searchText && this.searchText.trim()) {
      const termo = this.searchText.trim().toLowerCase();
      resultado = resultado.filter(f =>
        f.nome.toLowerCase().includes(termo) ||
        (f.cidade && f.cidade.toLowerCase().includes(termo)) ||
        (f.descricao && f.descricao.toLowerCase().includes(termo))
      );
    }

    if (this.precoMin != null && this.precoMin > 0) {
      resultado = resultado.filter(f => {
        const min = this.getMinPrice(f);
        return min >= (this.precoMin || 0);
      });
    }

    if (this.precoMax != null && this.precoMax > 0) {
      resultado = resultado.filter(f => {
        const min = this.getMinPrice(f);
        return min > 0 && min <= (this.precoMax || Infinity);
      });
    }

    if (this.minRating > 0) {
      resultado = resultado.filter(f => this.getAverageRating(f) >= this.minRating);
    }

    this.funerarias = resultado;
  }

  setMinRating(rating: number): void {
    this.minRating = this.minRating === rating ? 0 : rating;
    this.aplicarFiltros();
  }

  getAverageRating(funeraria: Funeraria): number {
    if (!funeraria.reviews || funeraria.reviews.length === 0) return 0;
    const sum = funeraria.reviews.reduce((acc: number, review: any) => acc + (review.nota || 0), 0);
    return Math.round((sum / funeraria.reviews.length) * 10) / 10;
  }

  getMinPrice(funeraria: Funeraria): number {
    if (!funeraria.servicos || funeraria.servicos.length === 0) return 0;
    return Math.min(...funeraria.servicos.map((s: any) => s.preco));
  }
}
