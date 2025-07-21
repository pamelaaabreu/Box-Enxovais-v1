import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ProductRegisterComponent } from '../app/product-register/product-register.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
 {
  path: 'home',
  loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
},

  { 
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  { path: 'cadastrar-produto', component: ProductRegisterComponent },
];
