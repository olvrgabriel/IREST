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
  perguntaSeguranca = '';
  respostaSeguranca = '';
  error = '';
  loading = false;

  perguntas = [
    'Qual o nome do seu primeiro pet?',
    'Qual o nome da sua mae?',
    'Qual a cidade onde voce nasceu?',
    'Qual o nome da sua escola primaria?',
    'Qual o seu prato favorito?'
  ];

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  register(): void {
    if (!this.nome || !this.email || !this.senha || !this.cidade || !this.perguntaSeguranca || !this.respostaSeguranca) {
      this.error = 'Preencha todos os campos obrigatorios';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.error = 'As senhas nao coincidem';
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
      endereco: this.endereco || undefined,
      perguntaSeguranca: this.perguntaSeguranca,
      respostaSeguranca: this.respostaSeguranca
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
          this.error = 'Erro ao cadastrar funeraria. Verifique os dados.';
        }
      }
    });
  }
}
