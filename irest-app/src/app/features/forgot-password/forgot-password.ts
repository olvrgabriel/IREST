import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  email = '';
  pergunta = '';
  resposta = '';
  novaSenha = '';
  confirmarSenha = '';
  error = '';
  success = '';
  loading = false;
  step: 'email' | 'resposta' | 'done' = 'email';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  buscarPergunta(): void {
    if (!this.email) {
      this.error = 'Informe seu email';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.forgotPassword(this.email).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res: any) => {
        this.pergunta = res.pergunta;
        this.step = 'resposta';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Email nao encontrado';
        this.cdr.detectChanges();
      }
    });
  }

  redefinirSenha(): void {
    if (!this.resposta || !this.novaSenha || !this.confirmarSenha) {
      this.error = 'Preencha todos os campos';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.error = 'A senha deve ter no minimo 6 caracteres';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.error = 'As senhas nao conferem';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.resetPassword(this.email, this.resposta, this.novaSenha).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.success = 'Senha alterada com sucesso! Redirecionando...';
        this.step = 'done';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Resposta incorreta';
        this.cdr.detectChanges();
      }
    });
  }
}
