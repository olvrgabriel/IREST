import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent {
  token = '';
  novaSenha = '';
  confirmarSenha = '';
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    if (!this.token || !this.novaSenha || !this.confirmarSenha) {
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
    this.success = '';

    this.authService.resetPassword(this.token, this.novaSenha).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Senha alterada com sucesso! Redirecionando para o login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao redefinir senha';
      }
    });
  }
}
