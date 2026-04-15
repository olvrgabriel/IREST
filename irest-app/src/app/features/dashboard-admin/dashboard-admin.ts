import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';
import { FunerariaService } from '../../services/funeraria.service';
import { UsuarioService } from '../../services/usuario.service';
import { ReviewService } from '../../services/review.service';
import { ServicoService } from '../../services/servico.service';
import { AdminService } from '../../services/admin.service';
import { FavoritoService } from '../../services/favorito.service';
import { Funeraria } from '../../models/funeraria.model';
import { Usuario } from '../../models/usuario.model';
import { Review } from '../../models/review.model';
import { Servico } from '../../models/servico.model';
import { Admin } from '../../models/admin.model';
import { Favorito } from '../../models/favorito.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin implements OnInit {
  activeTab = 'visao-geral';

  // Data
  funerarias: Funeraria[] = [];
  usuarios: Usuario[] = [];
  reviews: Review[] = [];
  servicos: Servico[] = [];
  admins: Admin[] = [];
  favoritos: Favorito[] = [];

  // Stats
  totalFunerarias = 0;
  totalUsuarios = 0;
  totalReviews = 0;
  totalServicos = 0;

  // Forms
  funerariaForm: any = { nome: '', descricao: '', cidade: '', estado: '', telefone: '', endereco: '' };
  usuarioForm: any = { nome: '', email: '', senha: '' };
  reviewForm: any = { nota: 5, comentario: '', usuarioId: null, funerariaId: null };
  servicoForm: any = { nome: '', descricao: '', preco: 0, funerariaId: null };
  adminForm: any = { nome: '', email: '', senha: '' };

  // State
  editingId = 0;
  showForm = false;
  error = '';
  success = '';

  constructor(
    public authService: AuthService,
    private funerariaService: FunerariaService,
    private usuarioService: UsuarioService,
    private reviewService: ReviewService,
    private servicoService: ServicoService,
    private adminService: AdminService,
    private favoritoService: FavoritoService,
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
    this.showForm = false;
    this.editingId = 0;

    switch (tab) {
      case 'funerarias': this.loadFunerarias(); break;
      case 'usuarios': this.loadUsuarios(); break;
      case 'avaliacoes': this.loadReviews(); break;
      case 'servicos': this.loadServicos(); break;
      case 'admins': this.loadAdmins(); break;
    }
  }

  // ===== LOAD ALL =====
  loadAllData(): void {
    this.loadFunerarias();
    this.loadUsuarios();
    this.loadReviews();
    this.loadServicos();
    this.loadAdmins();
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

  loadServicos(): void {
    this.servicoService.getAll().subscribe({
      next: (data) => {
        this.servicos = data;
        this.totalServicos = data.length;
        this.cdr.detectChanges();
      },
      error: () => { this.servicos = []; }
    });
  }

  loadAdmins(): void {
    this.adminService.getAll().subscribe({
      next: (data) => { this.admins = data; this.cdr.detectChanges(); },
      error: () => { this.admins = []; }
    });
  }

  // ===== FUNERARIAS CRUD =====
  openFunerariaForm(): void {
    this.resetFunerariaForm();
    this.showForm = true;
  }

  saveFuneraria(): void {
    this.clearMessages();
    if (!this.funerariaForm.nome || !this.funerariaForm.cidade) {
      this.error = 'Preencha nome e cidade';
      return;
    }
    const action = this.editingId
      ? this.funerariaService.update(this.editingId, this.funerariaForm)
      : this.funerariaService.create(this.funerariaForm);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Funerária atualizada!' : 'Funerária criada!';
        this.showForm = false;
        this.resetFunerariaForm();
        this.loadFunerarias();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar funerária'; this.cdr.detectChanges(); }
    });
  }

  editFuneraria(f: Funeraria): void {
    this.clearMessages();
    this.funerariaForm = {
      nome: f.nome, descricao: f.descricao || '', cidade: f.cidade,
      estado: f.estado || '', telefone: f.telefone || '', endereco: f.endereco || ''
    };
    this.editingId = f.id;
    this.showForm = true;
  }

  deleteFuneraria(id: number): void {
    if (!confirm('Tem certeza que deseja deletar esta funerária?')) return;
    this.clearMessages();
    this.funerariaService.deleteFuneraria(id).subscribe({
      next: () => { this.success = 'Funerária deletada!'; this.loadFunerarias(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar funerária'; this.cdr.detectChanges(); }
    });
  }

  resetFunerariaForm(): void {
    this.funerariaForm = { nome: '', descricao: '', cidade: '', estado: '', telefone: '', endereco: '' };
    this.editingId = 0;
  }

  // ===== USUARIOS CRUD =====
  openUsuarioForm(): void {
    this.resetUsuarioForm();
    this.showForm = true;
  }

  saveUsuario(): void {
    this.clearMessages();
    if (!this.usuarioForm.nome || !this.usuarioForm.email) {
      this.error = 'Preencha nome e email';
      return;
    }
    const action = this.editingId
      ? this.usuarioService.update(this.editingId, this.usuarioForm)
      : this.usuarioService.create(this.usuarioForm);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Usuário atualizado!' : 'Usuário criado!';
        this.showForm = false;
        this.resetUsuarioForm();
        this.loadUsuarios();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar usuário'; this.cdr.detectChanges(); }
    });
  }

  editUsuario(u: Usuario): void {
    this.clearMessages();
    this.usuarioForm = { nome: u.nome, email: u.email, senha: '' };
    this.editingId = u.id;
    this.showForm = true;
  }

  deleteUsuario(id: number): void {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    this.clearMessages();
    this.usuarioService.deleteUsuario(id).subscribe({
      next: () => { this.success = 'Usuário deletado!'; this.loadUsuarios(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar usuário'; this.cdr.detectChanges(); }
    });
  }

  resetUsuarioForm(): void {
    this.usuarioForm = { nome: '', email: '', senha: '' };
    this.editingId = 0;
  }

  // ===== REVIEWS CRUD =====
  deleteReview(id: number): void {
    if (!confirm('Tem certeza que deseja deletar esta avaliação?')) return;
    this.clearMessages();
    this.reviewService.deleteReview(id).subscribe({
      next: () => { this.success = 'Avaliação deletada!'; this.loadReviews(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar avaliação'; this.cdr.detectChanges(); }
    });
  }

  openReviewForm(): void {
    this.resetReviewForm();
    this.showForm = true;
  }

  saveReview(): void {
    this.clearMessages();
    if (!this.reviewForm.funerariaId || !this.reviewForm.usuarioId) {
      this.error = 'Preencha usuário e funerária';
      return;
    }
    const payload = {
      nota: Number(this.reviewForm.nota),
      comentario: this.reviewForm.comentario,
      usuarioId: Number(this.reviewForm.usuarioId),
      funerariaId: Number(this.reviewForm.funerariaId)
    };
    const action = this.editingId
      ? this.reviewService.update(this.editingId, payload)
      : this.reviewService.create(payload);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Avaliação atualizada!' : 'Avaliação criada!';
        this.showForm = false;
        this.resetReviewForm();
        this.loadReviews();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar avaliação'; this.cdr.detectChanges(); }
    });
  }

  editReview(r: Review): void {
    this.clearMessages();
    this.reviewForm = {
      nota: r.nota, comentario: r.comentario,
      usuarioId: r.usuarioId, funerariaId: r.funerariaId
    };
    this.editingId = r.id;
    this.showForm = true;
  }

  resetReviewForm(): void {
    this.reviewForm = { nota: 5, comentario: '', usuarioId: null, funerariaId: null };
    this.editingId = 0;
  }

  // ===== SERVICOS CRUD =====
  openServicoForm(): void {
    this.resetServicoForm();
    this.showForm = true;
  }

  saveServico(): void {
    this.clearMessages();
    if (!this.servicoForm.nome || !this.servicoForm.funerariaId) {
      this.error = 'Preencha nome e funerária';
      return;
    }
    const payload = {
      nome: this.servicoForm.nome,
      descricao: this.servicoForm.descricao,
      preco: Number(this.servicoForm.preco),
      funerariaId: Number(this.servicoForm.funerariaId)
    };
    const action = this.editingId
      ? this.servicoService.update(this.editingId, payload)
      : this.servicoService.create(payload);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Serviço atualizado!' : 'Serviço criado!';
        this.showForm = false;
        this.resetServicoForm();
        this.loadServicos();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar serviço'; this.cdr.detectChanges(); }
    });
  }

  editServico(s: Servico): void {
    this.clearMessages();
    this.servicoForm = {
      nome: s.nome, descricao: s.descricao || '',
      preco: s.preco, funerariaId: s.funerariaId
    };
    this.editingId = s.id;
    this.showForm = true;
  }

  deleteServico(id: number): void {
    if (!confirm('Tem certeza que deseja deletar este serviço?')) return;
    this.clearMessages();
    this.servicoService.deleteServico(id).subscribe({
      next: () => { this.success = 'Serviço deletado!'; this.loadServicos(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar serviço'; this.cdr.detectChanges(); }
    });
  }

  resetServicoForm(): void {
    this.servicoForm = { nome: '', descricao: '', preco: 0, funerariaId: null };
    this.editingId = 0;
  }

  // ===== ADMINS CRUD =====
  openAdminForm(): void {
    this.resetAdminForm();
    this.showForm = true;
  }

  saveAdmin(): void {
    this.clearMessages();
    if (!this.adminForm.nome || !this.adminForm.email) {
      this.error = 'Preencha nome e email';
      return;
    }
    if (!this.editingId && !this.adminForm.senha) {
      this.error = 'Senha é obrigatória para novo admin';
      return;
    }
    const action = this.editingId
      ? this.adminService.update(this.editingId, this.adminForm)
      : this.adminService.create(this.adminForm);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Admin atualizado!' : 'Admin criado!';
        this.showForm = false;
        this.resetAdminForm();
        this.loadAdmins();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar admin'; this.cdr.detectChanges(); }
    });
  }

  editAdmin(a: Admin): void {
    this.clearMessages();
    this.adminForm = { nome: a.nome, email: a.email, senha: '' };
    this.editingId = a.id;
    this.showForm = true;
  }

  deleteAdmin(id: number): void {
    if (!confirm('Tem certeza que deseja deletar este admin?')) return;
    this.clearMessages();
    this.adminService.deleteAdmin(id).subscribe({
      next: () => { this.success = 'Admin deletado!'; this.loadAdmins(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar admin'; this.cdr.detectChanges(); }
    });
  }

  resetAdminForm(): void {
    this.adminForm = { nome: '', email: '', senha: '' };
    this.editingId = 0;
  }

  // ===== HELPERS =====
  cancelForm(): void {
    this.showForm = false;
    this.editingId = 0;
    this.clearMessages();
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.nota, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  getFunerariaName(id: number): string {
    const f = this.funerarias.find(fun => fun.id === id);
    return f ? f.nome : 'ID ' + id;
  }

  getUsuarioName(id: number): string {
    const u = this.usuarios.find(usr => usr.id === id);
    return u ? u.nome : 'ID ' + id;
  }
}
