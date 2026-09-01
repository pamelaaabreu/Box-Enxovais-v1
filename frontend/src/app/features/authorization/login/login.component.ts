import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { CustomAlertService } from '../../../core/services/custom-alert.service';
import { LoginCredentials } from '../../../core/interfaces/auth.interface';
import { ShowPasswordComponent } from '../../../shared/css/show-password/show-password.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    ShowPasswordComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private customAlertService = inject(CustomAlertService);

  isPasswordVisible = false;
  isLoading = false;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue = this.loginForm.getRawValue();

    const credentials: LoginCredentials = {
      email: formValue.email,
      password: formValue.password,
    };

    this.isLoading = true;

    this.authService
      .login(credentials)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
            return;
          }

          this.router.navigate(['/home']);
        },

        error: (err) => {
          const errorMessage = err.error?.error || 'Email ou senha inválidos!';

          this.customAlertService.error('Falha no Login', errorMessage);
        },
      });
  }
}
