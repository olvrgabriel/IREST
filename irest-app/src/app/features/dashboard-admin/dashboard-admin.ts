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
  activeTab = 'overview';

  totalFunerarias = 0;
  totalUsuarios = 0;
  totalReviews = 0;

  funerarias: Funeraria[] = [];
  usuarios: Usuario[] = [];
  reviews: Review[] = [];

  funerariaForm: any = { nome: '', descricao: '', cidade: '', estado: '', latitude: null, longitude: null, telefone: '', endereco: '', horario: '' };
  editingFunerariaId = 0;

  usuarioForm: any = { nome: '', email: '', senha: '' };
  editingUsuarioId = 0;

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
    this.loadStats();
  }

  clearMessages(): void { this.error = ''; this.success = ''; }
  dismissSuccess(): void { this.success = ''; }
  dismissError(): void { this.error = ''; }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
    if (tab === 'funerarias') this.loadFunerarias();
    if (tab === 'usuarios') this.loadUsuarios();
    if (tab === 'reviews') this.loadReviews();
  }

  loadStats(): void {
    this.funerariaService.getAll().subscribe({
      next: (data) => { this.totalFunerarias = data.length; this.cdr.detectChanges(); }
    });
    this.usuarioService.getAll().subscribe({
      next: (data) => { this.totalUsuarios = data.length; this.cdr.detectChanges(); }
    });
    this.reviewService.getAll().subscribe({
      next: (data) => { this.totalReviews = data.length; this.cdr.detectChanges(); }
    });
  }

  // ===== FUNERARIAS =====
  loadFunerarias(): void {
    this.funerariaService.getAll().subscribe({
      next: (data) => { this.funerarias = data; this.cdr.detectChanges(); },
      error: () => { this.funerarias = []; }
    });
  }

  saveFuneraria(): void {
    this.clearMessages();
    if (!this.funerariaForm.nome || !this.funerariaForm.cidade) {
      this.error = 'Preencha nome e cidade';
      return;
    }
    const payload = {
      nome: this.funerariaForm.nome,
      descricao: this.funerariaForm.descricao || null,
      cidade: this.funerariaForm.cidade,
      estado: this.funerariaForm.estado || null,
      latitude: this.funerariaForm.latitude ? Number(this.funerariaForm.latitude) : null,
      longitude: this.funerariaForm.longitude ? Number(this.funerariaForm.longitude) : null,
      telefone: this.funerariaForm.telefone || null,
      endereco: this.funerariaForm.endereco || null,
      horario: this.funerariaForm.horario || null
    };
    const action = this.editingFunerariaId
      ? this.funerariaService.update(this.editingFunerariaId, payload)
      : this.funerariaService.create(payload);

    action.subscribe({
      next: () => {
        this.success = this.editingFunerariaId ? 'Funerária atualizada!' : 'Funerária criada!';
        this.resetFunerariaForm();
        this.loadFunerarias();
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar funerária'; this.cdr.detectChanges(); }
    });
  }

  editFuneraria(f: Funeraria): void {
    this.clearMessages();
    this.funerariaForm = {
      nome: f.nome, descricao: f.descricao, cidade: f.cidade, estado: f.estado,
      latitude: f.latitude, longitude: f.longitude,
      telefone: f.telefone, endereco: f.endereco, horario: f.horario
    };
    this.editingFunerariaId = f.id;
  }

  deleteFuneraria(id: number): void {
    if (!confirm('Tem certeza que deseja deletar esta funerária?')) return;
    this.clearMessages();
    this.funerariaService.deleteFuneraria(id).subscribe({
      next: () => { this.success = 'Funerária deletada!'; this.loadFunerarias(); this.loadStats(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar funerária'; this.cdr.detectChanges(); }
    });
  }

  resetFunerariaForm(): void {
    this.funerariaForm = { nome: '', descricao: '', cidade: '', estado: '', latitude: null, longitude: null, telefone: '', endereco: '', horario: '' };
    this.editingFunerariaId = 0;
  }

  // ===== USUARIOS =====
  loadUsuarios(): void {
    this.usuarioService.getAll().subscribe({
      next: (data) => { this.usuarios = data; this.cdr.detectChanges(); },
      error: () => { this.usuarios = []; }
    });
  }

  saveUsuario(): void {
    this.clearMessages();
    if (!this.usuarioForm.nome || !this.usuarioForm.email) {
      this.error = 'Preencha nome e email';
      return;
    }
    const action = this.editingUsuarioId
      ? this.usuarioService.update(this.editingUsuarioId, this.usuarioForm)
      : this.usuarioService.create(this.usuarioForm);

    action.subscribe({
      next: () => {
        this.success = this.editingUsuarioId ? 'Usuário atualizado!' : 'Usuário criado!';
        this.resetUsuarioForm();
        this.loadUsuarios();
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar usuário'; this.cdr.detectChanges(); }
    });
  }

  editUsuario(u: Usuario): void {
    this.clearMessages();
    this.usuarioForm = { nome: u.nome, email: u.email, senha: '' };
    this.editingUsuarioId = u.id;
  }

  deleteUsuario(id: number): void {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    this.clearMessages();
    this.usuarioService.deleteUsuario(id).subscribe({
      next: () => { this.success = 'Usuário deletado!'; this.loadUsuarios(); this.loadStats(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar usuário'; this.cdr.detectChanges(); }
    });
  }

  resetUsuarioForm(): void {
    this.usuarioForm = { nome: '', email: '', senha: '' };
    this.editingUsuarioId = 0;
  }

  // ===== REVIEWS (MODERACAO) =====
  loadReviews(): void {
    this.reviewService.getAll().subscribe({
      next: (data) => { this.reviews = data; this.cdr.detectChanges(); },
      error: () => { this.reviews = []; }
    });
  }

  deleteReview(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    this.clearMessages();
    this.reviewService.deleteReview(id).subscribe({
      next: () => { this.success = 'Avaliação excluída!'; this.loadReviews(); this.loadStats(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao excluir avaliação'; this.cdr.detectChanges(); }
    });
  }

  getAverageRating(funeraria: Funeraria): number {
    if (!funeraria.reviews || funeraria.reviews.length === 0) return 0;
    const sum = funeraria.reviews.reduce((acc: number, r: any) => acc + (r.nota || 0), 0);
    return Math.round((sum / funeraria.reviews.length) * 10) / 10;
  }
}
