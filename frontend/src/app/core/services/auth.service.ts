import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'http://localhost:8080';
  private platformId = inject(PLATFORM_ID);

  constructor() {}

  login(credentials: {
    email: string;
    password: string;
    remember?: boolean;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId) && response && response.token) {
          const storage = credentials.remember ? localStorage : sessionStorage;
          storage.setItem('authToken', response.token);
          if (response.name) {
            storage.setItem('userName', response.name);
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      sessionStorage.removeItem('userName');
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!(
        localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      );
    }
    return false;
  }

  getUserName(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return (
        localStorage.getItem('userName') || sessionStorage.getItem('userName')
      );
    }
    return null;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return (
        localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      );
    }
    return null;
  }
}
