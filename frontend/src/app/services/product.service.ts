import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Produto } from '../shared/models';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private http: HttpClient) {}
 getProduto(): Observable<Produto[]> {
  return this.http.get<Produto[]>('http://localhost:8080/api/produto');
}

// product.service.ts
uploadImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);
  return this.http.post('/api/upload', formData);
}
cadastrarProduto(formData: FormData) {
  return this.http.post('/api/produto', formData);
}


}
