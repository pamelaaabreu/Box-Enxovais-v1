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

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap((response) => {
        // Aqui, salva o token se ele vier na resposta da API.
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
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
    // O '!!' converte o valor (string ou null) em um booleano (true ou false).
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
