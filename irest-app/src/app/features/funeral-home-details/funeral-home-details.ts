import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FunerariaService } from '../../services/funeraria.service';
import { Funeraria } from '../../models/funeraria.model';
import { Review } from '../../models/review.model';
import { Servico } from '../../models/servico.model';

@Component({
  selector: 'app-funeral-home-details',
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule],
  templateUrl: './funeral-home-details.html',
  styleUrl: './funeral-home-details.css',
})
export class FuneralHomeDetails implements OnInit {
  funeraria: Funeraria | null = null;
  servicos: Servico[] = [];
  reviews: Review[] = [];
  loading = true;
  error: string | null = null;
  funerariaId: number = 0;

  constructor(
    private funerariaService: FunerariaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.funerariaId = idParam ? Number(idParam) : 0;
    if (this.funerariaId) {
      this.loadFuneraria();
    }
  }

  loadFuneraria(): void {
    this.funerariaService.getFunerariaById(this.funerariaId).subscribe({
      next: (data) => {
        this.funeraria = data;
        this.servicos = data.servicos || [];
        this.reviews = data.reviews || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar funeraria:', err);
        this.error = err.message || 'Erro ao carregar dados';
        this.loading = false;
      }
    });
  }

  getAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.nota, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
}
