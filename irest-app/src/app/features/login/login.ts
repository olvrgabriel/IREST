import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

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

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
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

    this.authService.login({ email: this.email, senha: this.senha }).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (user) => {
        if (user.role === 'admin') {
          this.router.navigate(['/painel-admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.error = 'Email ou senha invalidos';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Erro ao fazer login. Tente novamente.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
