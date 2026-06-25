import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ShowPasswordComponent } from '../../../shared/css/show-password/show-password.component';
import { CustomAlertService } from '../../../core/services/custom-alert.service';

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
  private CustomAlertService = inject(CustomAlertService);

  isPasswordVisible = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
        remember: this.loginForm.value.remember!,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('LOGIN RESPONSE:', response);

          if (response.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
            return;
          }

          this.router.navigate(['/home']);
        },

        error: (err) => {
          console.error(err);

          const errorMessage = err.error?.error || 'Email ou senha inválidos!';

          this.CustomAlertService.error('Falha no Login', errorMessage);
        },
      });
    }
  }
}
