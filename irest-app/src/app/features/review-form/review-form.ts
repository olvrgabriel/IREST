import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { FunerariaService } from '../../services/funeraria.service';
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
    nota: 5,
    comentario: '',
    titulo: ''
  };

  constructor(
    private reviewService: ReviewService,
    private funerariaService: FunerariaService,
    private route: ActivatedRoute,
    private router: Router
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
      },
      error: (err) => {
        console.error('Erro ao carregar funeraria:', err);
        this.error = err.message || 'Erro ao carregar dados';
        this.loading = false;
      }
    });
  }

  submitReview(): void {
    if (!this.review.comentario) {
      this.error = 'Preencha o comentario';
      return;
    }

    this.submitting = true;
    this.error = null;

    const payload = {
      nota: this.review.nota,
      comentario: this.review.comentario,
      funerariaId: this.funerariaId,
      usuarioId: 1
    };

    this.reviewService.create(payload).subscribe({
      next: () => {
        this.success = 'Avaliacao enviada com sucesso!';
        this.submitting = false;
        setTimeout(() => {
          this.router.navigate(['/detalhes', this.funerariaId]);
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao enviar avaliacao:', err);
        this.error = err.message || 'Erro ao enviar avaliacao';
        this.submitting = false;
      }
    });
  }
}
