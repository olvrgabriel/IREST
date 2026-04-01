import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  register(): void {
    if (!this.nome || !this.email || !this.senha) {
      this.error = 'Preencha todos os campos';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.error = 'As senhas não coincidem';
      return;
    }

    if (this.senha.length < 6) {
      this.error = 'A senha deve ter pelo menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({ nome: this.nome, email: this.email, senha: this.senha }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.title) {
          this.error = err.error.title;
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Erro ao criar conta. Verifique os dados e tente novamente.';
        }
      }
    });
  }
}
