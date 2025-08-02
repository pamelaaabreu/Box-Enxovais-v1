import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import Swal from 'sweetalert2';
import { AbstractControl, ValidationErrors } from '@angular/forms';

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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
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
      zipCode: ['', Validators.required],
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
    const cep = this.userForm.get('zipCode')?.value?.replace(/\D/g, '');

    if (cep && cep.length === 8) {
      this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
        next: (dados: any) => {
          Swal.close();
          if (dados.erro) {
            Swal.fire({
              title: 'CEP não encontrado',
              text: 'Verifique o CEP digitado.',
              scrollbarPadding: false,
              icon: 'warning',
              customClass: {
                container: 'custom-swal-container',
              },
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
            title: 'Erro na consulta',
            text: 'Serviço indisponível no momento.',
            icon: 'error',
            customClass: {
              container: 'custom-swal-container',
            },
            scrollbarPadding: false,
            confirmButtonColor: '#92402d',
            background: '#f5f5f5',
          });
          this.resetEndereco();
        },
      });
    }
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

  onSubmit() {
    // Verifica se o usuário tem menos de 18 anos
    if (this.userForm.get('birthDate')?.errors?.['minAge']) {
      Swal.fire({
        title: 'Idade insuficiente',
        text: 'Você deve ter 18 anos ou mais para se cadastrar.',
        icon: 'warning',
        confirmButtonColor: '#92402d',
        background: '#f5f5f5',
        customClass: {
          container: 'custom-swal-container',
        },
      });
      return;
    }
    
    if (this.userForm.valid) {
      Swal.fire({
        title: 'Criando sua conta...',
        allowOutsideClick: false,
        customClass: {
          container: 'custom-swal-container',
        },
        didOpen: () => Swal.showLoading(),
        background: '#f5f5f5',
      });

      this.http
        .post('http://localhost:8080/users', this.userForm.value)
        .subscribe({
          next: () => {
            Swal.fire({
              title: 'Cadastro concluído!',
              text: 'Sua conta foi criada com sucesso.',
              icon: 'success',
              confirmButtonText: 'Ir para a página inicial',
              confirmButtonColor: '#92402d',
              background: '#f5f5f5',
              scrollbarPadding: false,
              willClose: () => this.router.navigate(['/home']),
            });
          },
          error: (err) => {
            const errorMsg = this.getErrorMessage(err);

            if (errorMsg === 'email_duplicado') {
              Swal.fire({
                title: 'E-mail já cadastrado',
                html: `
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">✉️</div>
                    <div>
                      <p style="margin-bottom: 0.5rem;">O e-mail <strong>${
                        this.userForm.get('email')?.value
                      }</strong> já está cadastrado.</p>
                      <p style="font-size: 0.9rem;">Por favor, utilize outro e-mail ou <a href="/login" style="color: #92402d; font-weight: 600;">faça login</a>.</p>
                    </div>
                  </div>
                `,
                icon: 'error',
                confirmButtonText: 'Entendi!',
                confirmButtonColor: '#92402d',
                background: '#f5f5f5',
                customClass: {
                  container: 'no-scroll-swal',
                  popup: 'email-duplicate-popup',
                },
                scrollbarPadding: false,
              });
            } else if (errorMsg === 'cpf_duplicado') {
              Swal.fire({
                title: 'CPF já cadastrado',
                html: `
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">🆔</div>
                    <div>
                      <p style="margin-bottom: 0.5rem;">O CPF <strong>${
                        this.userForm.get('cpf')?.value
                      }</strong> já está cadastrado.</p>
                      <p style="font-size: 0.9rem;">Verifique os dados ou entre em contato com o suporte.</p>
                    </div>
                  </div>
                `,
                icon: 'error',
                confirmButtonText: 'Entendi!',
                confirmButtonColor: '#92402d',
                background: '#f5f5f5',
                customClass: {
                  container: 'no-scroll-swal',
                  popup: 'cpf-duplicate-popup',
                },
                scrollbarPadding: false,
              });
            } else {
              Swal.fire({
                title: 'Erro no cadastro',
                text: errorMsg,
                icon: 'error',
                confirmButtonText: 'Entendi',
                confirmButtonColor: '#92402d',
                background: '#f5f5f5',
                customClass: {
                  container: 'no-scroll-swal',
                },
                scrollbarPadding: false,
              });
            }
          },
        });
    } else {
      this.showFormErrors();
    }
  }

  private showFormErrors() {
    const emptyFields = this.getEmptyFields();

    if (emptyFields.length === Object.keys(this.userForm.controls).length) {
      Swal.fire({
        title: 'Atenção!',
        text: 'Todos os campos são obrigatórios.',
        icon: 'warning',
        customClass: {
          container: 'custom-swal-container',
        },
        scrollbarPadding: false,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#92402d',
        background: '#f5f5f5',
      });
    } else {
      const fieldsList = emptyFields
        .map((f) => this.getFieldName(f))
        .join(', ');
      Swal.fire({
        title: 'Campos obrigatórios',
        html: `Preencha os seguintes campos: <strong>${fieldsList}</strong>`,
        icon: 'warning',
        customClass: {
          container: 'custom-swal-container',
        },
        scrollbarPadding: false,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#92402d',
        background: '#f5f5f5',
      });
    }
  }

  private getEmptyFields(): string[] {
    return Object.keys(this.userForm.controls).filter((key) => {
      const control = this.userForm.get(key);
      return control?.errors?.['required'] && control?.pristine;
    });
  }

  private getFieldName(key: string): string {
    const fieldNames: Record<string, string> = {
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
    return fieldNames[key] || key;
  }

  private getErrorMessage(err: any): string {
    if (err.error && typeof err.error === 'object') {
      if (err.error.error === 'email_duplicado') {
        return 'email_duplicado';
      }
      if (err.error.error === 'cpf_duplicado') {
        return 'cpf_duplicado';
      }
    } else if (err.status === 409) {
      return 'Conflito: Dado duplicado.';
    } else if (err.status === 400) {
      return 'Dados inválidos. Verifique as informações.';
    } else if (err.status === 0) {
      return 'Erro de conexão com o servidor.';
    }
    return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
}

export class AgeValidator {
  static minimumAge(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age >= minAge) {
        return null;
      } else {
        return { minAge: { requiredAge: minAge, actualAge: age } };
      }
    };
  }
}
