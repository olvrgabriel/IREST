import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/components/header/header';
import { FunerariaService } from '../../services/funeraria.service';
import { Funeraria } from '../../models/funeraria.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  allFunerarias: Funeraria[] = [];
  funerarias: Funeraria[] = [];
  error: string | null = null;

  // Filtros
  searchText = '';
  precoMin: number | null = null;
  precoMax: number | null = null;
  cidadeSelecionada = '';
  tipoServicoSelecionado = '';

  // Opções dinâmicas
  cidades: string[] = [];
  tiposServico: string[] = [];

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
        this.buildFilterOptions();
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

  buildFilterOptions(): void {
    const cidadesSet = new Set<string>();
    const tiposSet = new Set<string>();

    for (const f of this.allFunerarias) {
      if (f.cidade) {
        cidadesSet.add(f.cidade);
      }
      if (f.servicos) {
        for (const s of f.servicos) {
          if (s.nome) {
            tiposSet.add(s.nome.toLowerCase());
          }
        }
      }
    }

    this.cidades = Array.from(cidadesSet).sort();
    this.tiposServico = Array.from(tiposSet).sort();
  }

  aplicarFiltros(): void {
    let resultado = [...this.allFunerarias];

    if (this.cidadeSelecionada) {
      resultado = resultado.filter(f => f.cidade === this.cidadeSelecionada);
    }

    if (this.tipoServicoSelecionado) {
      resultado = resultado.filter(f =>
        f.servicos && f.servicos.some((s: any) =>
          s.nome && s.nome.toLowerCase() === this.tipoServicoSelecionado
        )
      );
    }

    if (this.searchText && this.searchText.trim()) {
      const termo = this.searchText.trim().toLowerCase();
      resultado = resultado.filter(f =>
        f.nome.toLowerCase().includes(termo) ||
        (f.endereco && f.endereco.toLowerCase().includes(termo)) ||
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

    this.funerarias = resultado.slice(0, 2);
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

  getLocationLabel(funeraria: Funeraria): string {
    const parts: string[] = [];
    if (funeraria.cidade) parts.push(funeraria.cidade);
    if (funeraria.endereco) parts.push(funeraria.endereco);
    else if (funeraria.estado) parts.push(funeraria.estado);
    return parts.join(' \u2022 ');
  }
}
