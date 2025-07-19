import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
   imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit{
  userForm!: FormGroup;

 constructor(private fb: FormBuilder, private http: HttpClient) {}

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

 
  onSubmit() {
    if (this.userForm.valid) {
      this.http.post('http://localhost:8080/users', this.userForm.value)
        .subscribe({
          next: res => alert('✅ Usuário cadastrado com sucesso!'),
          error: err => alert('❌ Erro ao cadastrar usuário: ' + err.message)
        });
    } else {
      alert('⚠️ Preencha todos os campos!');
    }
  }
}



  