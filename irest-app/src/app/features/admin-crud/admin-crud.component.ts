import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { UsuarioService } from '../../services/usuario.service';
import { FunerariaService } from '../../services/funeraria.service';
import { ReviewService } from '../../services/review.service';
import { ServicoService } from '../../services/servico.service';
import { FavoritoService } from '../../services/favorito.service';
import { ChatbotSessionService } from '../../services/chatbot-session.service';
import { Admin } from '../../models/admin.model';
import { Usuario } from '../../models/usuario.model';
import { Funeraria } from '../../models/funeraria.model';
import { Review } from '../../models/review.model';
import { Servico } from '../../models/servico.model';
import { Favorito } from '../../models/favorito.model';
import { ChatbotSession } from '../../models/chatbot-session.model';

@Component({
  selector: 'app-admin-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-crud.component.html',
  styleUrls: ['./admin-crud.component.css']
})
export class AdminCrudComponent implements OnInit {
  activeTab: string = 'admins';

  admins: Admin[] = [];
  adminForm: any = { nome: '', email: '', senha: '' };

  usuarios: Usuario[] = [];
  usuarioForm: any = { nome: '', email: '', senha: '' };

  funerarias: Funeraria[] = [];
  funerariaForm: any = { nome: '', descricao: '', cidade: '', estado: '', latitude: null, longitude: null };

  reviews: Review[] = [];
  reviewForm: any = { nota: 5, comentario: '', usuarioId: null, funerariaId: null };

  servicos: Servico[] = [];
  servicoForm: any = { nome: '', descricao: '', preco: 0, funerariaId: null };

  favoritos: Favorito[] = [];
  favoritoForm: any = { usuarioId: null, funerariaId: null };

  chatbotSessions: ChatbotSession[] = [];

  error: string = '';
  success: string = '';
  editingId: number = 0;

  constructor(
    private adminService: AdminService,
    private usuarioService: UsuarioService,
    private funerariaService: FunerariaService,
    private reviewService: ReviewService,
    private servicoService: ServicoService,
    private favoritoService: FavoritoService,
    private chatbotSessionService: ChatbotSessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAdmins();
  }

  private clearMessages() {
    this.error = '';
    this.success = '';
  }

  dismissSuccess() { this.success = ''; }
  dismissError() { this.error = ''; }

  // ==== ADMINS ====
  loadAdmins() {
    this.adminService.getAll().subscribe({
      next: (data) => { this.admins = data; this.cdr.detectChanges(); },
      error: () => { this.admins = []; this.cdr.detectChanges(); }
    });
  }

  saveAdmin() {
    this.clearMessages();
    if (!this.adminForm.nome || !this.adminForm.email) {
      this.error = 'Preencha nome e email';
      return;
    }
    const action = this.editingId
      ? this.adminService.update(this.editingId, this.adminForm)
      : this.adminService.create(this.adminForm);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Admin atualizado!' : 'Admin criado!';
        this.resetAdminForm();
        this.loadAdmins();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar admin'; this.cdr.detectChanges(); }
    });
  }

  editAdmin(admin: Admin) {
    this.clearMessages();
    this.adminForm = { nome: admin.nome, email: admin.email, senha: '' };
    this.editingId = admin.id;
  }

  deleteAdmin(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    this.clearMessages();
    this.adminService.deleteAdmin(id).subscribe({
      next: () => { this.success = 'Admin deletado!'; this.loadAdmins(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar admin'; this.cdr.detectChanges(); }
    });
  }

  resetAdminForm() {
    this.adminForm = { nome: '', email: '', senha: '' };
    this.editingId = 0;
  }

  // ==== USUARIOS ====
  loadUsuarios() {
    this.usuarioService.getAll().subscribe({
      next: (data) => { this.usuarios = data; this.cdr.detectChanges(); },
      error: () => { this.usuarios = []; this.cdr.detectChanges(); }
    });
  }

  saveUsuario() {
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
        this.success = this.editingId ? 'Usuario atualizado!' : 'Usuario criado!';
        this.resetUsuarioForm();
        this.loadUsuarios();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar usuario'; this.cdr.detectChanges(); }
    });
  }

  editUsuario(usuario: Usuario) {
    this.clearMessages();
    this.usuarioForm = { nome: usuario.nome, email: usuario.email, senha: '' };
    this.editingId = usuario.id;
  }

  deleteUsuario(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    this.clearMessages();
    this.usuarioService.deleteUsuario(id).subscribe({
      next: () => { this.success = 'Usuario deletado!'; this.loadUsuarios(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar usuario'; this.cdr.detectChanges(); }
    });
  }

  resetUsuarioForm() {
    this.usuarioForm = { nome: '', email: '', senha: '' };
    this.editingId = 0;
  }

  // ==== FUNERARIAS ====
  loadFunerarias() {
    this.funerariaService.getAll().subscribe({
      next: (data) => { this.funerarias = data; this.cdr.detectChanges(); },
      error: () => { this.funerarias = []; this.cdr.detectChanges(); }
    });
  }

  saveFuneraria() {
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
      longitude: this.funerariaForm.longitude ? Number(this.funerariaForm.longitude) : null
    };
    const action = this.editingId
      ? this.funerariaService.update(this.editingId, payload)
      : this.funerariaService.create(payload);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Funeraria atualizada!' : 'Funeraria criada!';
        this.resetFunerariaForm();
        this.loadFunerarias();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar funeraria'; this.cdr.detectChanges(); }
    });
  }

  editFuneraria(funeraria: Funeraria) {
    this.clearMessages();
    this.funerariaForm = {
      nome: funeraria.nome, descricao: funeraria.descricao,
      cidade: funeraria.cidade, estado: funeraria.estado,
      latitude: funeraria.latitude, longitude: funeraria.longitude
    };
    this.editingId = funeraria.id;
  }

  deleteFuneraria(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    this.clearMessages();
    this.funerariaService.deleteFuneraria(id).subscribe({
      next: () => { this.success = 'Funeraria deletada!'; this.loadFunerarias(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar funeraria'; this.cdr.detectChanges(); }
    });
  }

  resetFunerariaForm() {
    this.funerariaForm = { nome: '', descricao: '', cidade: '', estado: '', latitude: null, longitude: null };
    this.editingId = 0;
  }

  // ==== REVIEWS ====
  loadReviews() {
    this.reviewService.getAll().subscribe({
      next: (data) => { this.reviews = data; this.cdr.detectChanges(); },
      error: () => { this.reviews = []; this.cdr.detectChanges(); }
    });
  }

  saveReview() {
    this.clearMessages();
    if (!this.reviewForm.funerariaId || !this.reviewForm.usuarioId) {
      this.error = 'Preencha usuario ID e funeraria ID';
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
        this.success = this.editingId ? 'Avaliacao atualizada!' : 'Avaliacao criada!';
        this.resetReviewForm();
        this.loadReviews();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar avaliacao'; this.cdr.detectChanges(); }
    });
  }

  editReview(review: Review) {
    this.clearMessages();
    this.reviewForm = {
      nota: review.nota, comentario: review.comentario,
      usuarioId: review.usuarioId, funerariaId: review.funerariaId
    };
    this.editingId = review.id;
  }

  deleteReview(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    this.clearMessages();
    this.reviewService.deleteReview(id).subscribe({
      next: () => { this.success = 'Avaliacao deletada!'; this.loadReviews(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar avaliacao'; this.cdr.detectChanges(); }
    });
  }

  resetReviewForm() {
    this.reviewForm = { nota: 5, comentario: '', usuarioId: null, funerariaId: null };
    this.editingId = 0;
  }

  // ==== SERVICOS ====
  loadServicos() {
    this.servicoService.getAll().subscribe({
      next: (data) => { this.servicos = data; this.cdr.detectChanges(); },
      error: () => { this.servicos = []; this.cdr.detectChanges(); }
    });
  }

  saveServico() {
    this.clearMessages();
    if (!this.servicoForm.nome || !this.servicoForm.funerariaId) {
      this.error = 'Preencha nome e funeraria ID';
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
        this.success = this.editingId ? 'Servico atualizado!' : 'Servico criado!';
        this.resetServicoForm();
        this.loadServicos();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar servico'; this.cdr.detectChanges(); }
    });
  }

  editServico(servico: Servico) {
    this.clearMessages();
    this.servicoForm = {
      nome: servico.nome, descricao: servico.descricao,
      preco: servico.preco, funerariaId: servico.funerariaId
    };
    this.editingId = servico.id;
  }

  deleteServico(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    this.clearMessages();
    this.servicoService.deleteServico(id).subscribe({
      next: () => { this.success = 'Servico deletado!'; this.loadServicos(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar servico'; this.cdr.detectChanges(); }
    });
  }

  resetServicoForm() {
    this.servicoForm = { nome: '', descricao: '', preco: 0, funerariaId: null };
    this.editingId = 0;
  }

  // ==== FAVORITOS ====
  loadFavoritos() {
    this.favoritoService.getAll().subscribe({
      next: (data) => { this.favoritos = data; this.cdr.detectChanges(); },
      error: () => { this.favoritos = []; this.cdr.detectChanges(); }
    });
  }

  saveFavorito() {
    this.clearMessages();
    if (!this.favoritoForm.usuarioId || !this.favoritoForm.funerariaId) {
      this.error = 'Preencha usuario ID e funeraria ID';
      return;
    }
    const payload = {
      usuarioId: Number(this.favoritoForm.usuarioId),
      funerariaId: Number(this.favoritoForm.funerariaId)
    };
    const action = this.editingId
      ? this.favoritoService.update(this.editingId, payload)
      : this.favoritoService.create(payload);

    action.subscribe({
      next: () => {
        this.success = this.editingId ? 'Favorito atualizado!' : 'Favorito criado!';
        this.resetFavoritoForm();
        this.loadFavoritos();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar favorito'; this.cdr.detectChanges(); }
    });
  }

  editFavorito(favorito: Favorito) {
    this.clearMessages();
    this.favoritoForm = { usuarioId: favorito.usuarioId, funerariaId: favorito.funerariaId };
    this.editingId = favorito.id;
  }

  deleteFavorito(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    this.clearMessages();
    this.favoritoService.deleteFavorito(id).subscribe({
      next: () => { this.success = 'Favorito deletado!'; this.loadFavoritos(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar favorito'; this.cdr.detectChanges(); }
    });
  }

  resetFavoritoForm() {
    this.favoritoForm = { usuarioId: null, funerariaId: null };
    this.editingId = 0;
  }

  // ==== CHATBOT SESSIONS ====
  loadChatbotSessions() {
    this.chatbotSessionService.getAll().subscribe({
      next: (data) => { this.chatbotSessions = data; this.cdr.detectChanges(); },
      error: () => { this.chatbotSessions = []; this.cdr.detectChanges(); }
    });
  }

  deleteChatbotSession(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    this.clearMessages();
    this.chatbotSessionService.deleteSession(id).subscribe({
      next: () => { this.success = 'Sessao deletada!'; this.loadChatbotSessions(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao deletar sessao'; this.cdr.detectChanges(); }
    });
  }

  // ===== UTILS =====
  switchTab(tab: string) {
    this.activeTab = tab;
    this.clearMessages();
    this.editingId = 0;

    switch (tab) {
      case 'admins': this.loadAdmins(); break;
      case 'usuarios': this.loadUsuarios(); break;
      case 'funerarias': this.loadFunerarias(); break;
      case 'reviews': this.loadReviews(); break;
      case 'servicos': this.loadServicos(); break;
      case 'favoritos': this.loadFavoritos(); break;
      case 'chatbot': this.loadChatbotSessions(); break;
    }
  }
}
