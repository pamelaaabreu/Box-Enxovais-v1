import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SweetAlertService } from '../../core/services/sweet-alert.service';
import { ShowPasswordComponent } from '../css/show-password/show-password.component';
import { CustomAlertService } from '../../core/services/custom-alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ShowPasswordComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  isPasswordVisible = false;
  resetForm: FormGroup;
  private token: string | null = null;

  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private CustomAlertService: CustomAlertService,
    // private alertService: SweetAlertService
  ) {
    this.resetForm = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/.*[?@#$%&].*/), // Validação de caractere especial
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');

    if (!tokenFromUrl) {
      this.CustomAlertService.error(
        'Token Inválido',
        'Token não encontrado. Por favor, use o link enviado para o seu e-mail.'
      );
      this.resetForm.disable();
      return;
    }

    this.token = tokenFromUrl;
    this.authService.validateResetToken(this.token).subscribe({
      error: (err) => {
        const errorMessage =
          err.error?.message ||
          'O link de redefinição de senha é inválido ou expirou.';
        this.CustomAlertService.error('Erro de Validação', errorMessage);
        this.resetForm.disable();
      },
    });
  }

  onSubmit(): void {
    const newPasswordControl = this.resetForm.get('newPassword');
    const confirmPasswordControl = this.resetForm.get('confirmPassword');

    // Validação sequencial para exibir alertas específicos
    if (
      newPasswordControl?.errors?.['required'] ||
      confirmPasswordControl?.errors?.['required']
    ) {
      this.CustomAlertService.error(
        'Campos Obrigatórios',
        'Por favor, preencha a nova senha e a confirmação.'
      );
      return;
    }

    if (newPasswordControl?.errors?.['minlength']) {
      this.CustomAlertService.error(
        'Senha Curta',
        'A senha deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (newPasswordControl?.errors?.['pattern']) {
      this.CustomAlertService.error(
        'Senha Inválida',
        'A senha deve conter um símbolo especial (?@#$%&).'
      );
      return;
    }

    const { newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.CustomAlertService.error(
        'Senhas não conferem',
        'Por favor, digite as senhas novamente.'
      );
      return;
    }

    if (!this.token) {
      this.CustomAlertService.error(
        'Erro de Token',
        'Token não disponível. A sessão pode ter expirado.'
      );
      return;
    }

    // Se todas as validações passarem, envia para a API
    this.isLoading = true;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetForm.disable();

        this.CustomAlertService.success(
          'Sucesso!',
          'Senha alterada com sucesso! Será redirecionado para a página de login.'
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage =
          err.error?.message ||
          'Não foi possível alterar a senha. O token pode ter expirado.';
        this.CustomAlertService.error('Erro ao Salvar', errorMessage);
      },
    });
  }
}
