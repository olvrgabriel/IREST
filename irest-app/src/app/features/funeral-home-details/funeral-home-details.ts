import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FunerariaService } from '../../services/funeraria.service';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
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
  isFavorited = false;
  favoritoId: number | null = null;
  favMessage = '';

  constructor(
    private funerariaService: FunerariaService,
    private favoritoService: FavoritoService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.funerariaId = idParam ? Number(idParam) : 0;
    if (this.funerariaId) {
      this.loadFuneraria();
      if (this.authService.isLoggedIn) {
        this.checkFavorite();
      }
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

  checkFavorite(): void {
    this.favoritoService.getAll().subscribe({
      next: (data) => {
        const userId = this.authService.userId;
        const fav = data.find(f => f.usuarioId === userId && f.funerariaId === this.funerariaId);
        if (fav) {
          this.isFavorited = true;
          this.favoritoId = fav.id;
        }
      }
    });
  }

  toggleFavorite(): void {
    if (!this.authService.isLoggedIn) return;

    if (this.isFavorited && this.favoritoId) {
      this.favoritoService.deleteFavorito(this.favoritoId).subscribe({
        next: () => {
          this.isFavorited = false;
          this.favoritoId = null;
          this.favMessage = 'Removido dos favoritos';
          setTimeout(() => this.favMessage = '', 2000);
        }
      });
    } else {
      const payload = {
        usuarioId: this.authService.userId!,
        funerariaId: this.funerariaId
      };
      this.favoritoService.create(payload).subscribe({
        next: (fav) => {
          this.isFavorited = true;
          this.favoritoId = fav.id;
          this.favMessage = 'Adicionado aos favoritos!';
          setTimeout(() => this.favMessage = '', 2000);
        }
      });
    }
  }

  getAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.nota, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
}
