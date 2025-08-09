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

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  private token: string | null = null;
  
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private alertService: SweetAlertService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');

    if (!tokenFromUrl) {
      this.alertService.showError('Token Inválido', 'Token não encontrado. Por favor, use o link enviado para o seu e-mail.');
      this.resetForm.disable();
      return;
    }

    this.token = tokenFromUrl;
    this.authService.validateResetToken(this.token).subscribe({
      error: (err) => {
        const errorMessage = err.error?.message || 'O link de redefinição de senha é inválido ou expirou.';
        this.alertService.showError('Erro de Validação', errorMessage);
        this.resetForm.disable();
      },
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
            this.alertService.showError('Formulário Inválido', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    const { newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.alertService.showError('Senhas não conferem', 'Por favor, digite as senhas novamente.');
      return;
    }

    if (!this.token) {
      this.alertService.showError('Erro de Token', 'Token não disponível. A sessão pode ter expirado.');
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetForm.disable();
        
        this.alertService.showSuccess('Sucesso!', 'Senha alterada com sucesso! Será redirecionado para a página de login.')
          .then(() => {
            this.router.navigate(['/login']);
          });
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Não foi possível alterar a senha. O token pode ter expirado.';
        this.alertService.showError('Erro ao Salvar', errorMessage);
      },
    });
  }
}
