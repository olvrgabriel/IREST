import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';
import { FunerariaService } from '../../services/funeraria.service';
import { UsuarioService } from '../../services/usuario.service';
import { ReviewService } from '../../services/review.service';
import { Funeraria } from '../../models/funeraria.model';
import { Usuario } from '../../models/usuario.model';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin implements OnInit {
  activeTab = 'moderacao';

  totalFunerarias = 0;
  totalUsuarios = 0;
  totalReviews = 0;

  funerarias: Funeraria[] = [];
  usuarios: Usuario[] = [];
  reviews: Review[] = [];

  error = '';
  success = '';

  constructor(
    public authService: AuthService,
    private funerariaService: FunerariaService,
    private usuarioService: UsuarioService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  clearMessages(): void { this.error = ''; this.success = ''; }
  dismissSuccess(): void { this.success = ''; }
  dismissError(): void { this.error = ''; }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  loadAllData(): void {
    this.loadFunerarias();
    this.loadUsuarios();
    this.loadReviews();
  }

  loadFunerarias(): void {
    this.funerariaService.getAll().subscribe({
      next: (data) => {
        this.funerarias = data;
        this.totalFunerarias = data.length;
        this.cdr.detectChanges();
      },
      error: () => { this.funerarias = []; }
    });
  }

  loadUsuarios(): void {
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.totalUsuarios = data.length;
        this.cdr.detectChanges();
      },
      error: () => { this.usuarios = []; }
    });
  }

  loadReviews(): void {
    this.reviewService.getAll().subscribe({
      next: (data) => {
        this.reviews = data;
        this.totalReviews = data.length;
        this.cdr.detectChanges();
      },
      error: () => { this.reviews = []; }
    });
  }

  // Moderation actions
  aprovarReview(id: number): void {
    this.reviews = this.reviews.filter(r => r.id !== id);
    this.success = 'Avaliação aprovada!';
    this.cdr.detectChanges();
  }

  rejeitarReview(id: number): void {
    if (!confirm('Tem certeza que deseja rejeitar esta avaliação?')) return;
    this.clearMessages();
    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.success = 'Avaliação rejeitada!';
        this.loadReviews();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao rejeitar avaliação'; this.cdr.detectChanges(); }
    });
  }

  // Funeraria actions
  editFuneraria(f: Funeraria): void {
    // Navigate to CRUD for editing
  }

  deleteFuneraria(id: number): void {
    if (!confirm('Tem certeza que deseja deletar esta funerária?')) return;
    this.clearMessages();
    this.funerariaService.deleteFuneraria(id).subscribe({
      next: () => { this.success = 'Funerária deletada!'; this.loadFunerarias(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar funerária'; this.cdr.detectChanges(); }
    });
  }

  // Usuario actions
  editUsuario(u: Usuario): void {
    // Navigate to CRUD for editing
  }

  deleteUsuario(id: number): void {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    this.clearMessages();
    this.usuarioService.deleteUsuario(id).subscribe({
      next: () => { this.success = 'Usuário deletado!'; this.loadUsuarios(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar usuário'; this.cdr.detectChanges(); }
    });
  }

  // Helpers
  getFunerariaName(funerariaId: number): string {
    const f = this.funerarias.find(fun => fun.id === funerariaId);
    return f ? f.nome : 'Funerária #' + funerariaId;
  }

  getUserRole(u: Usuario): string {
    // Check if user email contains "funeraria" to determine role display
    if (u.email && u.email.includes('funeraria')) return 'Funerária';
    return 'Usuário';
  }

  getUserRoleBadgeClass(u: Usuario): string {
    if (this.getUserRole(u) === 'Funerária') return 'badge badge-dark';
    return 'badge badge-outline';
  }
}
