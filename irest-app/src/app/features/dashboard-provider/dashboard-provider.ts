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
  activeTab = 'servicos';

  funeraria: Funeraria | null = null;
  servicos: Servico[] = [];
  reviews: Review[] = [];

  infoForm: any = { nome: '', descricao: '', cidade: '', estado: '', telefone: '', endereco: '', horario: '', cnpj: '' };

  servicoForm: any = { nome: '', descricao: '', preco: 0 };
  editingServicoId = 0;
  showServicoForm = false;

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
    this.showServicoForm = false;
  }

  // ===== FUNERARIA INFO =====
  loadFuneraria(): void {
    this.minhaFunerariaService.getMyFuneraria().subscribe({
      next: (data) => {
        this.funeraria = data;
        this.populateInfoForm();
        this.cdr.detectChanges();
      },
      error: () => { this.funeraria = null; }
    });
  }

  populateInfoForm(): void {
    if (!this.funeraria) return;
    this.infoForm = {
      nome: this.funeraria.nome || '',
      descricao: this.funeraria.descricao || '',
      cidade: this.funeraria.cidade || '',
      estado: this.funeraria.estado || '',
      telefone: this.funeraria.telefone || '',
      endereco: this.funeraria.endereco || '',
      horario: this.funeraria.horario || '',
      cnpj: ''
    };
  }

  saveInfo(): void {
    this.clearMessages();
    if (!this.infoForm.nome) {
      this.error = 'Nome é obrigatório';
      return;
    }
    this.minhaFunerariaService.updateMyFuneraria({
      nome: this.infoForm.nome,
      descricao: this.infoForm.descricao || null,
      cidade: this.infoForm.cidade || this.funeraria?.cidade || '',
      estado: this.infoForm.estado || null,
      telefone: this.infoForm.telefone || null,
      endereco: this.infoForm.endereco || null,
      horario: this.infoForm.horario || null,
      latitude: this.funeraria?.latitude || null,
      longitude: this.funeraria?.longitude || null
    }).subscribe({
      next: () => {
        this.success = 'Informações atualizadas!';
        this.loadFuneraria();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao atualizar informações'; this.cdr.detectChanges(); }
    });
  }

  // ===== SERVICOS =====
  loadServicos(): void {
    this.minhaFunerariaService.getMyServicos().subscribe({
      next: (data) => { this.servicos = data; this.cdr.detectChanges(); },
      error: () => { this.servicos = []; }
    });
  }

  openServicoForm(): void {
    this.resetServicoForm();
    this.showServicoForm = true;
    this.activeTab = 'servicos';
  }

  cancelServicoForm(): void {
    this.showServicoForm = false;
    this.resetServicoForm();
  }

  saveServico(): void {
    this.clearMessages();
    if (!this.servicoForm.nome || !this.servicoForm.preco) {
      this.error = 'Preencha nome e preço do serviço';
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
        this.success = this.editingServicoId ? 'Serviço atualizado!' : 'Serviço criado!';
        this.showServicoForm = false;
        this.resetServicoForm();
        this.loadServicos();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Erro ao salvar serviço'; this.cdr.detectChanges(); }
    });
  }

  editServico(s: Servico): void {
    this.clearMessages();
    this.servicoForm = { nome: s.nome, descricao: s.descricao, preco: s.preco };
    this.editingServicoId = s.id;
    this.showServicoForm = true;
  }

  deleteServico(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    this.clearMessages();
    this.minhaFunerariaService.deleteServico(id).subscribe({
      next: () => { this.success = 'Serviço excluído!'; this.loadServicos(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao excluir serviço'; this.cdr.detectChanges(); }
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

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getShortName(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0] + ' ' + parts[1].charAt(0) + '.';
    }
    return parts[0];
  }

  getCountForRating(nota: number): number {
    return this.reviews.filter(r => Math.round(r.nota) === nota).length;
  }

  getPercentForRating(nota: number): number {
    if (this.reviews.length === 0) return 0;
    return (this.getCountForRating(nota) / this.reviews.length) * 100;
  }
}
