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
  private apiUrl = 'http://localhost:8080/login';
  private registerUrl = 'http://localhost:8080/register';
  constructor() {}

  login(credentials: {
    email: string;
    password: string;
    remember?: boolean;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
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

  register(userData: any): Observable<any> {
    return this.http.post(this.registerUrl, userData);
  }

  logout(): void {
    localStorage.removeItem('authToken');
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
