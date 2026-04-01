import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-funeraria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './register-funeraria.html',
  styleUrl: './register-funeraria.css'
})
export class RegisterFunerariaComponent {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  cidade = '';
  estado = '';
  telefone = '';
  endereco = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  register(): void {
    if (!this.nome || !this.email || !this.senha || !this.cidade) {
      this.error = 'Preencha todos os campos obrigatórios';
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

    this.authService.registerFuneraria({
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      cidade: this.cidade,
      estado: this.estado || undefined,
      telefone: this.telefone || undefined,
      endereco: this.endereco || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/painel-funeraria']);
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Erro ao cadastrar funerária. Verifique os dados.';
        }
      }
    });
  }
}
