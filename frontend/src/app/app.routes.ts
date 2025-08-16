import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },

  // {
  //   path: 'cart',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
  // },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/authorization/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/authorization/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./shared/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  {
    path: 'image-upload/:id', // <--- CORREÇÃO AQUI
    loadComponent: () =>
      import(
        './features/product-image-upload/product-image-upload.component'
      ).then((m) => m.ProductImageUploadComponent),
  },

  {
    path: 'image-register',
    loadComponent: () =>
      import('./features/product-create/product-create.component').then(
        (m) => m.ProductCreateComponent
      ),
  },

  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: '404' },
];
