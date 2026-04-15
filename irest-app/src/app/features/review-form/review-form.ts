import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { FunerariaService } from '../../services/funeraria.service';
import { AuthService } from '../../services/auth.service';
import { Funeraria } from '../../models/funeraria.model';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css',
})
export class ReviewForm implements OnInit {
  funeraria: Funeraria | null = null;
  funerariaId: number = 0;
  loading = true;
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  review = {
    nota: 0,
    comentario: ''
  };

  aspects = [
    { label: 'Atendimento da equipe', rating: 0 },
    { label: 'Qualidade dos serviços', rating: 0 },
    { label: 'Pontualidade', rating: 0 },
    { label: 'Instalações', rating: 0 },
    { label: 'Custo-benefício', rating: 0 },
  ];

  constructor(
    private reviewService: ReviewService,
    private funerariaService: FunerariaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
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
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar funerária:', err);
        this.error = err.message || 'Erro ao carregar dados';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReview(): void {
    if (this.review.nota === 0) {
      this.error = 'Selecione uma nota';
      return;
    }

    this.submitting = true;
    this.error = null;

    const payload = {
      nota: this.review.nota,
      comentario: this.review.comentario,
      funerariaId: this.funerariaId,
      usuarioId: this.authService.userId || 0
    };

    this.reviewService.create(payload).subscribe({
      next: () => {
        this.success = 'Avaliação enviada com sucesso!';
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/detalhes', this.funerariaId]);
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao enviar avaliação:', err);
        this.error = err.message || 'Erro ao enviar avaliação';
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
