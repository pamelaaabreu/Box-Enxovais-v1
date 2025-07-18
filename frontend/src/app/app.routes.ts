import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
// import { MinhaContaComponent } from './minha-conta/minha-conta.component';
// import { CadastroComponent } from './minha-conta/cadastro/cadastro.component';
// import { LoginComponent } from './minha-conta/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
];
