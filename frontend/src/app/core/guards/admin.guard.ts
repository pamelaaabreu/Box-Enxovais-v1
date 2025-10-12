import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  Route,
  UrlSegment,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate, CanLoad {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Para CanActivate (rotas internas do módulo)
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAdmin();
  }

  // Para CanLoad (lazy-loaded modules)
  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return this.checkAdmin();
  }

  private checkAdmin(): boolean {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken && decodedToken.role === 'admin') {
          return true;
        }
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
      }
    }
    this.router.navigate(['/']);
    return false;
  }
}
