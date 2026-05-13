import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  error = '';
  success = '';
  token = '';
  loading = false;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  submit(): void {
    if (!this.email) {
      this.error = 'Informe seu email';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.forgotPassword(this.email).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.token) {
          this.success = 'Codigo de recuperacao gerado com sucesso!';
          this.token = res.token;
        } else {
          this.success = (res && res.message) || 'Se o email estiver cadastrado, um codigo foi gerado.';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err.status === 0) {
          this.error = 'Nao foi possivel conectar ao servidor. Verifique se a API esta rodando.';
        } else {
          this.error = err.error?.message || 'Erro ao solicitar recuperacao';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
