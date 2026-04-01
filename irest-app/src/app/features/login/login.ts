import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  senha = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  login(): void {
    if (!this.email || !this.senha) {
      this.error = 'Preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, senha: this.senha }).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'admin') {
          this.router.navigate(['/painel-admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Email ou senha invalidos';
        }
      }
    });
  }
}
