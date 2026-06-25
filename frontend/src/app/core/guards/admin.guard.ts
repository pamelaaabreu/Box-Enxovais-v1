import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanMatch,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth.service';
import { AppJwtPayload } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate, CanMatch {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    return this.checkAdmin();
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    return this.checkAdmin();
  }

  private checkAdmin(): boolean | UrlTree {
    const token = this.authService.getToken();

    if (!token) {
      return this.router.createUrlTree(['/login']);
    }

    try {
      const decodedToken = jwtDecode<AppJwtPayload>(token);

      if (this.isTokenExpired(decodedToken)) {
        return this.router.createUrlTree(['/login']);
      }

      const role = decodedToken.role?.trim().toLowerCase();

      if (role === 'admin') {
        return true;
      }

      return this.router.createUrlTree(['/home']);
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return this.router.createUrlTree(['/login']);
    }
  }

  private isTokenExpired(token: AppJwtPayload): boolean {
    if (!token.exp) {
      return true;
    }

    const expirationDateInMilliseconds = token.exp * 1000;

    return Date.now() >= expirationDateInMilliseconds;
  }
}
