import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  LoginCredentials,
  RegisterPayload,
} from '../../../core/interfaces/auth.interface';
import { AuthService } from '../../../core/services/auth.service';
import { CustomAlertService } from '../../../core/services/custom-alert.service';
import { RegisterValidators } from '../../../core/validators/register.validators';
import { ShowPasswordComponent } from '../../../shared/css/show-password/show-password.component';

type PasswordRequirement =
  | 'length'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'symbol';

type ValidatableField = 'name' | 'email' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    ShowPasswordComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly customAlertService = inject(CustomAlertService);
  private readonly route = inject(ActivatedRoute);

  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  isLoginPasswordVisible = false;
  isLoading = false;
  selectedTab = 0;

  readonly userForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, RegisterValidators.fullName()]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          RegisterValidators.strongPassword(),
        ],
      ],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    },
    {
      validators: RegisterValidators.passwordsMatch(),
    },
  );

  readonly registerForm = this.userForm;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    this.route.data.subscribe((data) => {
      this.selectedTab = data['selectedTab'] === 1 ? 1 : 0;
    });
  }

  get isRegisterTab(): boolean {
    return this.selectedTab === 1;
  }

  onAuthTabChange(index: number): void {
    this.selectedTab = index;
    const destination = index === 1 ? '/register' : '/login';
    void this.router.navigate([destination]);
  }

  onSubmit(): void {
    if (this.selectedTab === 1) {
      this.submitRegister();
      return;
    }

    this.submitLogin();
  }

  submitRegister(): void {
    if (this.isLoading) {
      return;
    }

    this.userForm.markAllAsTouched();
    this.userForm.updateValueAndValidity();

    if (this.userForm.invalid) {
      this.showValidationAlert();
      return;
    }

    const { confirmPassword: _confirmPassword, ...formValue } =
      this.userForm.getRawValue();

    const payload: RegisterPayload = formValue;

    this.isLoading = true;
    this.customAlertService.loading('Criando sua conta...');

    this.authService
      .register(payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.customAlertService.hideLoading();
        }),
      )
      .subscribe({
        next: async () => {
          await this.customAlertService.success(
            'Cadastro concluído!',
            'Sua conta foi criada com sucesso.',
          );

          await this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error);

          if (errorMessage === 'email_duplicado') {
            this.customAlertService.showEmailDuplicate(
              this.userForm.controls.email.value,
            );
            return;
          }

          this.customAlertService.error('Erro no cadastro', errorMessage);
        },
      });
  }

  submitLogin(): void {
    if (this.isLoading) {
      return;
    }

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    const credentials: LoginCredentials = this.loginForm.getRawValue();
    this.isLoading = true;

    this.authService
      .login(credentials)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          const destination =
            response.role === 'admin' ? '/admin/dashboard' : '/home';
          void this.router.navigate([destination]);
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error?.error || 'E-mail ou senha inválidos!';
          this.customAlertService.error('Falha no login', message);
        },
      });
  }

  showError(
    formName: 'register' | 'login',
    controlName:
      | keyof typeof this.registerForm.controls
      | keyof typeof this.loginForm.controls,
  ): boolean {
    const control =
      formName === 'register'
        ? this.registerForm.controls[
            controlName as keyof typeof this.registerForm.controls
          ]
        : this.loginForm.controls[
            controlName as keyof typeof this.loginForm.controls
          ];

    return control.invalid && control.touched;
  }

  passwordsMismatch(): boolean {
    const confirmPasswordControl = this.userForm.controls.confirmPassword;

    return (
      this.userForm.hasError('passwordsMismatch') &&
      confirmPasswordControl.touched &&
      confirmPasswordControl.value.length > 0
    );
  }

  passwordRequirementMet(requirement: PasswordRequirement): boolean {
    const password = this.userForm.controls.password.value;

    const requirements: Record<PasswordRequirement, boolean> = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[?@#$%&]/.test(password),
    };

    return requirements[requirement];
  }

  fieldIsValid(controlName: ValidatableField): boolean {
    const control = this.userForm.controls[controlName];

    if (!control.value || control.invalid) {
      return false;
    }

    if (controlName === 'confirmPassword') {
      return control.value === this.userForm.controls.password.value;
    }

    return true;
  }

  private showValidationAlert(): void {
    if (this.userForm.controls.name.invalid) {
      this.customAlertService.warning(
        'Nome inválido',
        'Informe seu nome e sobrenome.',
      );
      return;
    }

    if (this.userForm.controls.email.invalid) {
      this.customAlertService.warning(
        'E-mail inválido',
        'Informe um endereço de e-mail válido.',
      );
      return;
    }

    if (this.userForm.controls.password.hasError('required')) {
      this.customAlertService.warning(
        'Senha obrigatória',
        'Informe uma senha para criar sua conta.',
      );
      return;
    }

    if (
      this.userForm.controls.password.hasError('weakPassword') ||
      this.userForm.controls.password.hasError('minlength')
    ) {
      this.customAlertService.warning(
        'Senha inválida',
        'Use ao menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e símbolo (?@#$%&).',
      );
      return;
    }

    if (this.userForm.controls.confirmPassword.hasError('required')) {
      this.customAlertService.warning(
        'Confirme sua senha',
        'Digite novamente a senha informada.',
      );
      return;
    }

    if (this.userForm.hasError('passwordsMismatch')) {
      this.customAlertService.warning(
        'Senhas diferentes',
        'A confirmação precisa ser igual à senha informada.',
      );
      return;
    }

    if (this.userForm.controls.terms.hasError('required')) {
      this.customAlertService.warning(
        'Termos de Uso',
        'Você precisa aceitar os Termos de Uso para continuar.',
      );
      return;
    }

    this.customAlertService.warning(
      'Revise seus dados',
      'Preencha corretamente os campos destacados.',
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error?.error;

    if (apiError === 'email_duplicado') {
      return 'email_duplicado';
    }

    if (typeof apiError === 'string' && apiError.trim().length > 0) {
      return apiError;
    }

    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    if (error.status === 400) {
      return 'Dados inválidos. Revise as informações e tente novamente.';
    }

    if (error.status === 409) {
      return 'email_duplicado';
    }

    return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
}
