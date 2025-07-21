import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';

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
    private router: Router
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
      cpf: ['', Validators.required],
      phone: ['', Validators.required],
      street: ['', Validators.required],
      neighborhood: ['', Validators.required],
      number: ['', Validators.required],
      zipCode: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onCepBlur() {
    const cep = this.userForm.get('zipCode')?.value?.replace(/\D/g, '');

    if (cep && cep.length === 8) {
      // Limpa o formulário antes de preencher
      this.resetEndereco();

      this.http
        .get(`https://viacep.com.br/ws/${cep}/json/`)
        .pipe(
          tap((dados: any) => {
            if (dados.erro) {
              alert('CEP não encontrado.');
              this.resetEndereco();
            } else {
              this.patchEndereco(dados);
            }
          })
        )
        .subscribe({
          error: (_err) => {
            alert('Ocorreu um erro ao buscar o CEP.');
            this.resetEndereco();
          },
        });
    }
  }

  patchEndereco(dados: any) {
    this.userForm.patchValue({
      street: dados.logradouro,
      neighborhood: dados.bairro,
      city: dados.localidade,
      state: dados.uf,
    });
  }

  resetEndereco() {
    this.userForm.patchValue({
      street: '',
      neighborhood: '',
      city: '',
      state: '',
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.http
        .post('http://localhost:8080/users', this.userForm.value)
        .subscribe({
          next: (res) => {
            alert('✅ Usuário cadastrado com sucesso!');
            this.router.navigate(['/home']);
          },
          error: (err) => alert('❌ Erro ao cadastrar usuário: ' + err.message),
        });
    } else {
      alert('⚠️ Preencha todos os campos!');
    }
  }
}
