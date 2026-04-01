import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { FavoritoService } from '../../services/favorito.service';
import { Review } from '../../models/review.model';
import { Favorito } from '../../models/favorito.model';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule],
  templateUrl: './dashboard-user.html',
  styleUrl: './dashboard-user.css',
})
export class DashboardUser implements OnInit {
  activeTab = 'overview';
  favoritos: Favorito[] = [];
  userReviews: Review[] = [];

  error = '';
  success = '';

  constructor(
    public authService: AuthService,
    private reviewService: ReviewService,
    private favoritoService: FavoritoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFavoritos();
    this.loadUserReviews();
  }

  clearMessages(): void { this.error = ''; this.success = ''; }
  dismissSuccess(): void { this.success = ''; }
  dismissError(): void { this.error = ''; }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  loadFavoritos(): void {
    this.favoritoService.getAll().subscribe({
      next: (data) => {
        const userId = this.authService.userId;
        this.favoritos = data.filter(f => f.usuarioId === userId);
        this.cdr.detectChanges();
      },
      error: () => { this.favoritos = []; }
    });
  }

  removeFavorito(id: number): void {
    if (!confirm('Remover dos favoritos?')) return;
    this.clearMessages();
    this.favoritoService.deleteFavorito(id).subscribe({
      next: () => { this.success = 'Favorito removido!'; this.loadFavoritos(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao remover favorito'; this.cdr.detectChanges(); }
    });
  }

  loadUserReviews(): void {
    this.reviewService.getAll().subscribe({
      next: (data) => {
        const userId = this.authService.userId;
        this.userReviews = data.filter(r => r.usuarioId === userId);
        this.cdr.detectChanges();
      },
      error: () => { this.userReviews = []; }
    });
  }

  deleteReview(id: number): void {
    if (!confirm('Excluir esta avaliacao?')) return;
    this.clearMessages();
    this.reviewService.deleteReview(id).subscribe({
      next: () => { this.success = 'Avaliacao excluida!'; this.loadUserReviews(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao excluir avaliacao'; this.cdr.detectChanges(); }
    });
  }
}
