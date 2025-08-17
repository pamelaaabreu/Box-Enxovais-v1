import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../../shared/models';
import { forkJoin, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient) {}

  createProduct(product: Product): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, product);
  }

   getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

    getProductsByIds(ids: number[]): Observable<Product[]> {
    const requests = ids.map(id => this.getProduct(id));
    return forkJoin(requests);
  }
}
