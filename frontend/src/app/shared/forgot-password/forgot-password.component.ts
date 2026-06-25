import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { SweetAlertService } from '../../core/services/sweet-alert.service';
import { CustomAlertService } from '../../core/services/custom-alert.service';

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

  // controle de etapa
  step: 1 | 2 = 1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private customAlert: CustomAlertService,
    private alertService: SweetAlertService,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: [{ value: '', disabled: true }, [Validators.required]],
      newPassword: [
        { value: '', disabled: true },
        [Validators.required, Validators.minLength(6)],
      ],
    });
  }

  onSubmit() {
    if (this.step === 1) {
      this.sendCode();
    } else {
      this.resetPassword();
    }
  }

  // Solicitar código
  private sendCode() {
    const emailControl = this.forgotForm.get('email');

    if (!emailControl || emailControl.invalid) {
      emailControl?.markAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.requestPasswordReset(emailControl.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 2; // muda para etapa 2
        this.forgotForm.get('code')?.enable();
        this.forgotForm.get('newPassword')?.enable();

        this.customAlert.success(
          'Código de verificação enviado para o seu e-mail.',
        );
      },
      error: (error) => {
        this.isLoading = false;

        this.customAlert.error(
          'Erro ao solicitar redefinição',
          'Se o email existir em nosso sistema, um código foi enviado.',
        );

        console.error('Erro ao solicitar reset:', error);
      },
    });
  }

  private resetPassword() {
    const codeControl = this.forgotForm.get('code');
    const passwordControl = this.forgotForm.get('newPassword');

    if (
      !codeControl ||
      !passwordControl ||
      codeControl.invalid ||
      passwordControl.invalid
    ) {
      codeControl?.markAsTouched();
      passwordControl?.markAsTouched();
      return;
    }

    this.isLoading = true;

    const { email, code, newPassword } = this.forgotForm.getRawValue();

    this.authService.resetPassword(email, code, newPassword).subscribe({
      next: () => {
        this.isLoading = false;

        this.customAlert.success('Senha alterada com sucesso!');

        // resetar fluxo
        this.step = 1;
        this.forgotForm.reset();
        this.forgotForm.get('code')?.disable();
        this.forgotForm.get('newPassword')?.disable();
      },
      error: (error) => {
        this.isLoading = false;

        this.customAlert.error(
          'Erro ao alterar senha',
          'Código inválido ou expirado.',
        );

        console.error('Erro ao resetar senha:', error);
      },
    });
  }
}
