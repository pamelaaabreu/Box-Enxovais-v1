import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MinhaContaComponent } from './minha-conta/minha-conta.component';
import { CadastroComponent } from './minha-conta/cadastro/cadastro.component';
import { LoginComponent } from './minha-conta/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'minha-conta',
    component: MinhaContaComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'cadastro', component: CadastroComponent }
    ]
  }, 
];
