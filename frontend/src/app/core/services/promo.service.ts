import { Injectable } from '@angular/core';
import { AddToPromotionRequest, CreatePromotionRequest, Product } from '../../shared/models';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PromoService {
  private apiUrl = 'http://localhost:8080/api/promotions';

  constructor(private http: HttpClient) {}

  getPromotionalProducts(promoName: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/${promoName}`);
  }
  addProductToPromotion(request: AddToPromotionRequest): Observable<any> {
    const url = `${this.apiUrl}/add`;
    return this.http.post(url, request);
  }
  createPromotion(request: CreatePromotionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, request);
  }
}
