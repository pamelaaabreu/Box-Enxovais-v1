import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Produto } from '../shared/models';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = '/api/produtos';

  constructor(private http: HttpClient) {}
 getProdutos(): Observable<Produto[]> {
  return this.http.get<Produto[]>('http://localhost:8080/api/produto');
}

}
