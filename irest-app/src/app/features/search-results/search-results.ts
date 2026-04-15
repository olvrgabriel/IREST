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
  cidadeSelecionada = '';
  precoMin: number | null = null;
  precoMax: number | null = null;
  ratingFilters: { [key: number]: boolean } = { 5: false, 4: false, 3: false, 2: false, 1: false };
  servicoFilters: { [key: string]: boolean } = {};

  // Dados dinâmicos
  cidades: string[] = [];
  servicosDisponiveis: string[] = [];

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
        this.extrairCidades();
        this.extrairServicos();
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar funerárias:', err);
        this.error = 'Erro ao carregar funerárias. Verifique se o backend está rodando.';
        this.cdr.detectChanges();
      }
    });
  }

  extrairCidades(): void {
    const cidadesSet = new Set<string>();
    this.allFunerarias.forEach(f => {
      if (f.cidade) cidadesSet.add(f.cidade);
    });
    this.cidades = Array.from(cidadesSet).sort();
  }

  extrairServicos(): void {
    const servicosSet = new Set<string>();
    this.allFunerarias.forEach(f => {
      if (f.servicos) {
        f.servicos.forEach((s: any) => {
          if (s.nome) servicosSet.add(s.nome);
        });
      }
    });
    this.servicosDisponiveis = Array.from(servicosSet).sort();
    this.servicosDisponiveis.forEach(s => {
      if (!(s in this.servicoFilters)) {
        this.servicoFilters[s] = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.allFunerarias];

    // Filtro por cidade
    if (this.cidadeSelecionada) {
      resultado = resultado.filter(f => f.cidade === this.cidadeSelecionada);
    }

    // Filtro por preço mínimo
    if (this.precoMin != null && this.precoMin > 0) {
      resultado = resultado.filter(f => {
        const min = this.getMinPrice(f);
        return min >= (this.precoMin || 0);
      });
    }

    // Filtro por preço máximo
    if (this.precoMax != null && this.precoMax > 0) {
      resultado = resultado.filter(f => {
        const min = this.getMinPrice(f);
        return min > 0 && min <= (this.precoMax || Infinity);
      });
    }

    // Filtro por avaliação (checkboxes - usa o menor valor marcado)
    const ratingsAtivos = Object.entries(this.ratingFilters)
      .filter(([_, checked]) => checked)
      .map(([rating, _]) => Number(rating));

    if (ratingsAtivos.length > 0) {
      const minRating = Math.min(...ratingsAtivos);
      resultado = resultado.filter(f => this.getAverageRating(f) >= minRating);
    }

    // Filtro por serviços
    const servicosAtivos = Object.entries(this.servicoFilters)
      .filter(([_, checked]) => checked)
      .map(([nome, _]) => nome.toLowerCase());

    if (servicosAtivos.length > 0) {
      resultado = resultado.filter(f => {
        if (!f.servicos) return false;
        const servicosFuneraria = f.servicos.map((s: any) => s.nome?.toLowerCase());
        return servicosAtivos.every(sa => servicosFuneraria.includes(sa));
      });
    }

    this.funerarias = resultado;
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

  getStars(count: number): string {
    return '\u2605'.repeat(count);
  }
}
