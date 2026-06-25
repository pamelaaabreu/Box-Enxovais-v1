import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, tap } from 'rxjs';
import {
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private baseUrl = 'http://localhost:8080';

  public isLogged = false;
  public userName: string | null = null;
  public userChanged = new Subject<void>();

  loadUser(): void {
    if (!this.isBrowser()) {
      return;
    }

    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');

    this.isLogged = !!token;
    this.userName = name || null;
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const payload: LoginCredentials = {
      email: credentials.email,
      password: credentials.password,
    };

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((response) => {
        if (!this.isBrowser() || !response?.token) {
          return;
        }

        this.saveAuthData(response);

        this.isLogged = true;
        this.userName = response.name || null;
        this.userChanged.next();
      }),
    );
  }

  register(userData: RegisterPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-reset-token`, { email });
  }

  resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, {
      email,
      code,
      newPassword,
    });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/validate-reset-token/${token}`);
  }

  logout(): void {
    if (this.isBrowser()) {
      this.clearAuthData();
    }

    this.isLogged = false;
    this.userName = null;
    this.userChanged.next();

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    return !!sessionStorage.getItem('authToken');
  }

  getUserName(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return sessionStorage.getItem('userName');
  }

  getUserEmail(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return sessionStorage.getItem('userEmail');
  }

  getUserRole(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return sessionStorage.getItem('userRole');
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return sessionStorage.getItem('authToken');
  }

  private saveAuthData(response: LoginResponse): void {
    sessionStorage.setItem('authToken', response.token);

    if (response.name) {
      sessionStorage.setItem('userName', response.name);
    }

    if (response.email) {
      sessionStorage.setItem('userEmail', response.email);
    }

    if (response.role) {
      sessionStorage.setItem('userRole', response.role);
    }

    this.removeOldLocalStorageAuthData();
  }

  private clearAuthData(): void {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');

    this.removeOldLocalStorageAuthData();
  }

  private removeOldLocalStorageAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
