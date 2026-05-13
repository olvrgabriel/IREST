import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/components/header/header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  email = '';
  error = '';
  success = '';
  token = '';
  loading = false;

  constructor(private authService: AuthService) {}

  submit(): void {
    if (!this.email) {
      this.error = 'Informe seu email';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = 'Codigo de recuperacao gerado com sucesso!';
        if (res.token) {
          this.token = res.token;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao solicitar recuperacao';
      }
    });
  }
}
