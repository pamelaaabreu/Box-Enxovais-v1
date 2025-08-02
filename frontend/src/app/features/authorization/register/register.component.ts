import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import Swal from 'sweetalert2';
import { SweetAlertService } from '../../../services/sweet-alert.service';

export class CepValidators {
  static cepInvalido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cep = control.value?.replace(/\D/g, '');
      if (cep && /^(\d)\1{7}$/.test(cep)) {
        return { cepInvalido: true };
      }
      return null;
    };
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class RegisterComponent implements OnInit {
  userForm!: FormGroup;
  private ultimoCepValidado: string = '';
  private fieldNamesMap: Record<string, string> = {
    name: 'Nome completo',
    email: 'E-mail',
    birthDate: 'Data de nascimento',
    cpf: 'CPF',
    phone: 'Telefone',
    street: 'Logradouro',
    neighborhood: 'Bairro',
    number: 'Número',
    zipCode: 'CEP',
    state: 'Estado',
    city: 'Cidade',
    password: 'Senha',
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private alertService: SweetAlertService,
    @Inject('Swal') private swal: typeof Swal
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required, AgeValidator.minimumAge(18)]],
      cpf: ['', Validators.required],
      phone: ['', Validators.required],
      street: ['', Validators.required],
      neighborhood: ['', Validators.required],
      number: ['', Validators.required],
      zipCode: ['', [Validators.required, CepValidators.cepInvalido()]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])/),
        ],
      ],
    });
  }

  onCepBlur() {
    this.validateCepOnBlur();
  }

  private patchEndereco(dados: any) {
    this.userForm.patchValue({
      street: dados.logradouro,
      neighborhood: dados.bairro,
      city: dados.localidade,
      state: dados.uf,
    });
  }

  private resetEndereco() {
    this.userForm.patchValue({
      street: '',
      neighborhood: '',
      city: '',
      state: '',
    });
  }

  private validateCepOnBlur(): void {
    const cepControl = this.userForm.get('zipCode');
    const cep = cepControl?.value?.replace(/\D/g, '');

    if (cep === this.ultimoCepValidado) {
      return;
    }

    this.ultimoCepValidado = cep;
    if (cepControl?.invalid) {
      return;
    }

    if (!cep || cep.length !== 8) {
      return;
    }

    this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (dados: any) => {
        if (dados.erro) {
          Swal.fire({
            title: 'CEP não encontrado',
            text: 'Verifique o CEP digitado. Se estiver correto, preencha o endereço manualmente.',
            icon: 'warning',
            confirmButtonColor: '#92402d',
            background: '#f5f5f5',
          });
          this.resetEndereco();
        } else {
          this.patchEndereco(dados);
        }
      },
      error: () => {
        Swal.fire({
          title: 'Erro na consulta do CEP',
          text: 'Serviço indisponível. Preencha o endereço manualmente.',
          icon: 'error',
          confirmButtonColor: '#92402d',
          background: '#f5f5f5',
        });
        this.resetEndereco();
      },
    });
  }

  async onSubmit() {
    this.userForm.markAllAsTouched();

    if (this.userForm.get('zipCode')?.hasError('cepInvalido')) {
      this.alertService.showError(
        'CEP inválido',
        'O CEP informado não é válido. Por favor, corrija.'
      );
      return;
    }

    if (this.userForm.get('birthDate')?.hasError('minAge')) {
      this.alertService.showWarning(
        'Idade insuficiente',
        'Você deve ter 18 anos ou mais para se cadastrar.'
      );
      return;
    }

    if (this.userForm.invalid) {
      this.showFormErrors();
      return;
    }

    this.enviarCadastro();
  }

  private async enviarCadastro() {
  this.alertService.showLoading('Criando sua conta...');

  this.http
    .post('http://localhost:8080/users', this.userForm.value)
    .subscribe({
      next: async () => {
        this.alertService.hideLoading();

        await this.alertService.showSuccess(
          'Cadastro concluído!',
          'Sua conta foi criada com sucesso.'
        );

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.alertService.hideLoading();
        const errorMsg = this.getErrorMessage(err);
        const email = this.userForm.get('email')?.value;
        const cpf = this.userForm.get('cpf')?.value;
        
        if (errorMsg === 'email_duplicado') {
          this.alertService.showEmailDuplicate(email);
        } else if (errorMsg === 'cpf_duplicado') {
          this.alertService.showCpfDuplicate(cpf);
        } else {
          this.alertService.showError('Erro no cadastro', errorMsg);
        }
      },
    });
}
  private showFormErrors() {
    this.alertService.showFormValidationErrors(
      this.userForm,
      this.fieldNamesMap
    );
  }

  private getErrorMessage(err: any): string {
    if (err.error?.error === 'email_duplicado') return 'email_duplicado';
    if (err.error?.error === 'cpf_duplicado') return 'cpf_duplicado';
    if (err.status === 409) return 'Conflito: Dado duplicado.';
    if (err.status === 400) return 'Dados inválidos. Verifique as informações.';
    if (err.status === 0) return 'Erro de conexão com o servidor.';
    return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
}

export class AgeValidator {
  static minimumAge(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= minAge
        ? null
        : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }
}
