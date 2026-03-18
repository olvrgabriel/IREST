import { Component, OnInit } from '@angular/core';
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

  // Admins
  admins: Admin[] = [];
  adminForm: any = { nome: '', email: '' };

  // Usuarios
  usuarios: Usuario[] = [];
  usuarioForm: any = { nome: '', email: '', senha: '' };

  // Funerarias
  funerarias: Funeraria[] = [];
  funerariaForm: any = { nome: '', descricao: '', cidade: '', estado: '', latitude: 0, longitude: 0 };

  // Reviews
  reviews: Review[] = [];
  reviewForm: any = { nota: 5, comentario: '', usuarioId: 0, funerariaId: 0 };

  // Servicos
  servicos: Servico[] = [];
  servicoForm: any = { nome: '', descricao: '', preco: 0, funerariaId: 0 };

  // Favoritos
  favoritos: Favorito[] = [];
  favoritoForm: any = { usuarioId: 0, funerariaId: 0 };

  // Chatbot Sessions
  chatbotSessions: ChatbotSession[] = [];

  loading: boolean = false;
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
    private chatbotSessionService: ChatbotSessionService
  ) {}

  ngOnInit() {
    this.loadAdmins();
  }

  // ==== ADMINS ====
  loadAdmins() {
    this.loading = true;
    this.adminService.getAll().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar admins';
        this.loading = false;
      }
    });
  }

  saveAdmin() {
    if (!this.adminForm.nome || !this.adminForm.email) {
      this.error = 'Preencha todos os campos';
      return;
    }

    if (this.editingId) {
      this.adminService.update(this.editingId, this.adminForm).subscribe({
        next: () => {
          this.success = 'Admin atualizado com sucesso!';
          this.loadAdmins();
          this.resetAdminForm();
        },
        error: () => this.error = 'Erro ao atualizar admin'
      });
    } else {
      this.adminService.create(this.adminForm).subscribe({
        next: () => {
          this.success = 'Admin criado com sucesso!';
          this.loadAdmins();
          this.resetAdminForm();
        },
        error: () => this.error = 'Erro ao criar admin'
      });
    }
  }

  editAdmin(admin: Admin) {
    this.adminForm = { nome: admin.nome, email: admin.email };
    this.editingId = admin.id;
  }

  deleteAdmin(id: number) {
    if (confirm('Tem certeza que deseja deletar?')) {
      this.adminService.deleteAdmin(id).subscribe({
        next: () => {
          this.success = 'Admin deletado com sucesso!';
          this.loadAdmins();
        },
        error: () => this.error = 'Erro ao deletar admin'
      });
    }
  }

  resetAdminForm() {
    this.adminForm = { nome: '', email: '' };
    this.editingId = 0;
  }

  // ==== USUARIOS ====
  loadUsuarios() {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar usuarios';
        this.loading = false;
      }
    });
  }

  saveUsuario() {
    if (!this.usuarioForm.nome || !this.usuarioForm.email) {
      this.error = 'Preencha todos os campos';
      return;
    }

    if (this.editingId) {
      this.usuarioService.update(this.editingId, this.usuarioForm).subscribe({
        next: () => {
          this.success = 'Usuario atualizado com sucesso!';
          this.loadUsuarios();
          this.resetUsuarioForm();
        },
        error: () => this.error = 'Erro ao atualizar usuario'
      });
    } else {
      this.usuarioService.create(this.usuarioForm).subscribe({
        next: () => {
          this.success = 'Usuario criado com sucesso!';
          this.loadUsuarios();
          this.resetUsuarioForm();
        },
        error: () => this.error = 'Erro ao criar usuario'
      });
    }
  }

  editUsuario(usuario: Usuario) {
    this.usuarioForm = { nome: usuario.nome, email: usuario.email };
    this.editingId = usuario.id;
  }

  deleteUsuario(id: number) {
    if (confirm('Tem certeza que deseja deletar?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => {
          this.success = 'Usuario deletado com sucesso!';
          this.loadUsuarios();
        },
        error: () => this.error = 'Erro ao deletar usuario'
      });
    }
  }

  resetUsuarioForm() {
    this.usuarioForm = { nome: '', email: '', senha: '' };
    this.editingId = 0;
  }

  // ==== FUNERARIAS ====
  loadFunerarias() {
    this.loading = true;
    this.funerariaService.getAll().subscribe({
      next: (data) => {
        this.funerarias = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar funerarias';
        this.loading = false;
      }
    });
  }

  saveFuneraria() {
    if (!this.funerariaForm.nome || !this.funerariaForm.cidade) {
      this.error = 'Preencha todos os campos obrigatorios';
      return;
    }

    if (this.editingId) {
      this.funerariaService.update(this.editingId, this.funerariaForm).subscribe({
        next: () => {
          this.success = 'Funeraria atualizada com sucesso!';
          this.loadFunerarias();
          this.resetFunerariaForm();
        },
        error: () => this.error = 'Erro ao atualizar funeraria'
      });
    } else {
      this.funerariaService.create(this.funerariaForm).subscribe({
        next: () => {
          this.success = 'Funeraria criada com sucesso!';
          this.loadFunerarias();
          this.resetFunerariaForm();
        },
        error: () => this.error = 'Erro ao criar funeraria'
      });
    }
  }

  editFuneraria(funeraria: Funeraria) {
    this.funerariaForm = {
      nome: funeraria.nome, descricao: funeraria.descricao,
      cidade: funeraria.cidade, estado: funeraria.estado,
      latitude: funeraria.latitude, longitude: funeraria.longitude
    };
    this.editingId = funeraria.id;
  }

  deleteFuneraria(id: number) {
    if (confirm('Tem certeza que deseja deletar?')) {
      this.funerariaService.deleteFuneraria(id).subscribe({
        next: () => {
          this.success = 'Funeraria deletada com sucesso!';
          this.loadFunerarias();
        },
        error: () => this.error = 'Erro ao deletar funeraria'
      });
    }
  }

  resetFunerariaForm() {
    this.funerariaForm = { nome: '', descricao: '', cidade: '', estado: '', latitude: 0, longitude: 0 };
    this.editingId = 0;
  }

  // ==== REVIEWS ====
  loadReviews() {
    this.loading = true;
    this.reviewService.getAll().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar avaliacoes';
        this.loading = false;
      }
    });
  }

  saveReview() {
    if (!this.reviewForm.funerariaId || !this.reviewForm.usuarioId) {
      this.error = 'Preencha todos os campos obrigatorios';
      return;
    }

    const payload = {
      nota: this.reviewForm.nota,
      comentario: this.reviewForm.comentario,
      usuarioId: Number(this.reviewForm.usuarioId),
      funerariaId: Number(this.reviewForm.funerariaId)
    };

    if (this.editingId) {
      this.reviewService.update(this.editingId, payload).subscribe({
        next: () => {
          this.success = 'Avaliacao atualizada com sucesso!';
          this.loadReviews();
          this.resetReviewForm();
        },
        error: () => this.error = 'Erro ao atualizar avaliacao'
      });
    } else {
      this.reviewService.create(payload).subscribe({
        next: () => {
          this.success = 'Avaliacao criada com sucesso!';
          this.loadReviews();
          this.resetReviewForm();
        },
        error: () => this.error = 'Erro ao criar avaliacao'
      });
    }
  }

  editReview(review: Review) {
    this.reviewForm = {
      nota: review.nota, comentario: review.comentario,
      usuarioId: review.usuarioId, funerariaId: review.funerariaId
    };
    this.editingId = review.id;
  }

  deleteReview(id: number) {
    if (confirm('Tem certeza que deseja deletar?')) {
      this.reviewService.deleteReview(id).subscribe({
        next: () => {
          this.success = 'Avaliacao deletada com sucesso!';
          this.loadReviews();
        },
        error: () => this.error = 'Erro ao deletar avaliacao'
      });
    }
  }

  resetReviewForm() {
    this.reviewForm = { nota: 5, comentario: '', usuarioId: 0, funerariaId: 0 };
    this.editingId = 0;
  }

  // ==== SERVICOS ====
  loadServicos() {
    this.loading = true;
    this.servicoService.getAll().subscribe({
      next: (data) => {
        this.servicos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar servicos';
        this.loading = false;
      }
    });
  }

  saveServico() {
    if (!this.servicoForm.nome || !this.servicoForm.funerariaId) {
      this.error = 'Preencha todos os campos obrigatorios';
      return;
    }

    const payload = {
      nome: this.servicoForm.nome,
      descricao: this.servicoForm.descricao,
      preco: Number(this.servicoForm.preco),
      funerariaId: Number(this.servicoForm.funerariaId)
    };

    if (this.editingId) {
      this.servicoService.update(this.editingId, payload).subscribe({
        next: () => {
          this.success = 'Servico atualizado com sucesso!';
          this.loadServicos();
          this.resetServicoForm();
        },
        error: () => this.error = 'Erro ao atualizar servico'
      });
    } else {
      this.servicoService.create(payload).subscribe({
        next: () => {
          this.success = 'Servico criado com sucesso!';
          this.loadServicos();
          this.resetServicoForm();
        },
        error: () => this.error = 'Erro ao criar servico'
      });
    }
  }

  editServico(servico: Servico) {
    this.servicoForm = {
      nome: servico.nome, descricao: servico.descricao,
      preco: servico.preco, funerariaId: servico.funerariaId
    };
    this.editingId = servico.id;
  }

  deleteServico(id: number) {
    if (confirm('Tem certeza que deseja deletar?')) {
      this.servicoService.deleteServico(id).subscribe({
        next: () => {
          this.success = 'Servico deletado com sucesso!';
          this.loadServicos();
        },
        error: () => this.error = 'Erro ao deletar servico'
      });
    }
  }

  resetServicoForm() {
    this.servicoForm = { nome: '', descricao: '', preco: 0, funerariaId: 0 };
    this.editingId = 0;
  }

  // ==== FAVORITOS ====
  loadFavoritos() {
    this.loading = true;
    this.favoritoService.getAll().subscribe({
      next: (data) => {
        this.favoritos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar favoritos';
        this.loading = false;
      }
    });
  }

  saveFavorito() {
    if (!this.favoritoForm.usuarioId || !this.favoritoForm.funerariaId) {
      this.error = 'Preencha todos os campos obrigatorios';
      return;
    }

    const payload = {
      usuarioId: Number(this.favoritoForm.usuarioId),
      funerariaId: Number(this.favoritoForm.funerariaId)
    };

    if (this.editingId) {
      this.favoritoService.update(this.editingId, payload).subscribe({
        next: () => {
          this.success = 'Favorito atualizado com sucesso!';
          this.loadFavoritos();
          this.resetFavoritoForm();
        },
        error: () => this.error = 'Erro ao atualizar favorito'
      });
    } else {
      this.favoritoService.create(payload).subscribe({
        next: () => {
          this.success = 'Favorito criado com sucesso!';
          this.loadFavoritos();
          this.resetFavoritoForm();
        },
        error: () => this.error = 'Erro ao criar favorito'
      });
    }
  }

  editFavorito(favorito: Favorito) {
    this.favoritoForm = { usuarioId: favorito.usuarioId, funerariaId: favorito.funerariaId };
    this.editingId = favorito.id;
  }

  deleteFavorito(id: number) {
    if (confirm('Tem certeza que deseja deletar?')) {
      this.favoritoService.deleteFavorito(id).subscribe({
        next: () => {
          this.success = 'Favorito deletado com sucesso!';
          this.loadFavoritos();
        },
        error: () => this.error = 'Erro ao deletar favorito'
      });
    }
  }

  resetFavoritoForm() {
    this.favoritoForm = { usuarioId: 0, funerariaId: 0 };
    this.editingId = 0;
  }

  // ==== CHATBOT SESSIONS ====
  loadChatbotSessions() {
    this.loading = true;
    this.chatbotSessionService.getAll().subscribe({
      next: (data) => {
        this.chatbotSessions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar sessoes de chat';
        this.loading = false;
      }
    });
  }

  deleteChatbotSession(id: number) {
    if (confirm('Tem certeza que deseja deletar?')) {
      this.chatbotSessionService.deleteSession(id).subscribe({
        next: () => {
          this.success = 'Sessao de chat deletada com sucesso!';
          this.loadChatbotSessions();
        },
        error: () => this.error = 'Erro ao deletar sessao de chat'
      });
    }
  }

  // ===== UTILS =====
  switchTab(tab: string) {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
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

  clearMessages() {
    this.error = '';
    this.success = '';
  }
}
