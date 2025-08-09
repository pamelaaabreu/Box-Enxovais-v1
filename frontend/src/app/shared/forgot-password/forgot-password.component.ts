import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router'; // Importe o RouterLink
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { SweetAlertService } from '../../core/services/sweet-alert.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  message = '';
  isSuccess = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: SweetAlertService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.isSuccess = false;

    this.authService
      .requestPasswordReset(this.forgotForm.value.email!)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.forgotForm.disable();
          this.alertService.showSuccess(
            'Link de recuperação enviado para o seu e-mail.'
          );
        },
        error: (error) => {
          this.isSuccess = false;
          this.alertService.showError(
            'Erro ao solicitar redefinição',
            'Se o email existir em nosso sistema, um link para redefinir sua senha foi enviado.'
          );
          this.isLoading = false;
          console.error('Erro ao solicitar reset de senha:', error);
        },
      });
  }
}
