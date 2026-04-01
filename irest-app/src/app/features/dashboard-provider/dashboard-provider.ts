import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';
import { MinhaFunerariaService } from '../../services/minha-funeraria.service';
import { Funeraria } from '../../models/funeraria.model';
import { Servico } from '../../models/servico.model';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-dashboard-provider',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-provider.html',
  styleUrl: './dashboard-provider.css',
})
export class DashboardProvider implements OnInit {
  activeTab = 'overview';

  funeraria: Funeraria | null = null;
  servicos: Servico[] = [];
  reviews: Review[] = [];

  // Edit funeraria info
  infoForm: any = { nome: '', descricao: '', cidade: '', estado: '', telefone: '', endereco: '', horario: '', latitude: null, longitude: null };
  editingInfo = false;

  // Servico form
  servicoForm: any = { nome: '', descricao: '', preco: 0 };
  editingServicoId = 0;

  error = '';
  success = '';

  constructor(
    public authService: AuthService,
    private minhaFunerariaService: MinhaFunerariaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFuneraria();
    this.loadServicos();
    this.loadReviews();
  }

  clearMessages(): void { this.error = ''; this.success = ''; }
  dismissSuccess(): void { this.success = ''; }
  dismissError(): void { this.error = ''; }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  // ===== FUNERARIA INFO =====
  loadFuneraria(): void {
    this.minhaFunerariaService.getMyFuneraria().subscribe({
      next: (data) => { this.funeraria = data; this.cdr.detectChanges(); },
      error: () => { this.funeraria = null; }
    });
  }

  startEditInfo(): void {
    if (!this.funeraria) return;
    this.infoForm = {
      nome: this.funeraria.nome, descricao: this.funeraria.descricao || '',
      cidade: this.funeraria.cidade, estado: this.funeraria.estado || '',
      telefone: this.funeraria.telefone || '', endereco: this.funeraria.endereco || '',
      horario: this.funeraria.horario || '', latitude: this.funeraria.latitude, longitude: this.funeraria.longitude
    };
    this.editingInfo = true;
  }

  cancelEditInfo(): void {
    this.editingInfo = false;
    this.clearMessages();
  }

  saveInfo(): void {
    this.clearMessages();
    if (!this.infoForm.nome || !this.infoForm.cidade) {
      this.error = 'Nome e cidade sao obrigatorios';
      return;
    }
    this.minhaFunerariaService.updateMyFuneraria({
      nome: this.infoForm.nome,
      descricao: this.infoForm.descricao || null,
      cidade: this.infoForm.cidade,
      estado: this.infoForm.estado || null,
      telefone: this.infoForm.telefone || null,
      endereco: this.infoForm.endereco || null,
      horario: this.infoForm.horario || null,
      latitude: this.infoForm.latitude ? Number(this.infoForm.latitude) : null,
      longitude: this.infoForm.longitude ? Number(this.infoForm.longitude) : null
    }).subscribe({
      next: () => {
        this.success = 'Informacoes atualizadas!';
        this.editingInfo = false;
        this.loadFuneraria();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao atualizar informacoes'; this.cdr.detectChanges(); }
    });
  }

  // ===== SERVICOS =====
  loadServicos(): void {
    this.minhaFunerariaService.getMyServicos().subscribe({
      next: (data) => { this.servicos = data; this.cdr.detectChanges(); },
      error: () => { this.servicos = []; }
    });
  }

  saveServico(): void {
    this.clearMessages();
    if (!this.servicoForm.nome || !this.servicoForm.preco) {
      this.error = 'Preencha nome e preco do servico';
      return;
    }
    const payload = {
      nome: this.servicoForm.nome,
      descricao: this.servicoForm.descricao || null,
      preco: Number(this.servicoForm.preco)
    };

    const action = this.editingServicoId
      ? this.minhaFunerariaService.updateServico(this.editingServicoId, payload)
      : this.minhaFunerariaService.createServico(payload);

    action.subscribe({
      next: () => {
        this.success = this.editingServicoId ? 'Servico atualizado!' : 'Servico criado!';
        this.resetServicoForm();
        this.loadServicos();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar servico'; this.cdr.detectChanges(); }
    });
  }

  editServico(s: Servico): void {
    this.clearMessages();
    this.servicoForm = { nome: s.nome, descricao: s.descricao, preco: s.preco };
    this.editingServicoId = s.id;
  }

  deleteServico(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este servico?')) return;
    this.clearMessages();
    this.minhaFunerariaService.deleteServico(id).subscribe({
      next: () => { this.success = 'Servico excluido!'; this.loadServicos(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao excluir servico'; this.cdr.detectChanges(); }
    });
  }

  resetServicoForm(): void {
    this.servicoForm = { nome: '', descricao: '', preco: 0 };
    this.editingServicoId = 0;
  }

  // ===== REVIEWS =====
  loadReviews(): void {
    this.minhaFunerariaService.getMyReviews().subscribe({
      next: (data) => { this.reviews = data; this.cdr.detectChanges(); },
      error: () => { this.reviews = []; }
    });
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.nota, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
}
