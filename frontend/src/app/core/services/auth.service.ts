// auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  // ✅ 1. Defina uma URL base para a API
  private baseUrl = 'http://localhost:8080';

  constructor() {}

  login(credentials: {
    email: string;
    password: string;
    remember?: boolean;
  }): Observable<any> {
    // ✅ 2. Use a URL base para montar as rotas
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          if (credentials.remember) {
            localStorage.setItem('authToken', response.token);
          } else {
            sessionStorage.setItem('authToken', response.token);
          }
        }
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/validate-reset-token/${token}`);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  logout(): void {
    // ✅ 3. (Bônus) Limpe o sessionStorage também!
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!(
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
  }

  getToken(): string | null {
    return (
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
  }
}
