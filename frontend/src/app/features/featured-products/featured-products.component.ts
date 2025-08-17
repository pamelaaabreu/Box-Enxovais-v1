import { Component, Input, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
  @Input() titulo: string = 'Título Padrão';
  backendUrl = 'http://localhost:8080';
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    const featuredProductIds = [5, 6, 7, 8, 9, 10];

    this.productService.getProductsByIds(featuredProductIds).subscribe({
      next: (data) => {
        this.products = data;
        console.log('Produtos em destaque carregados:', this.products);
      },
      error: (err) =>
        console.error('Erro ao buscar produtos em destaque:', err),
    });
  }
}
