import { ProductMediaComponent } from '../catalog/components/product-media/product-media.component';
import { CartService } from '../../core/services/cart.service';
import { RouterLink } from '@angular/router';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [ProductMediaComponent, CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
  readonly cart = inject(CartService);
  @Input() titulo: string = 'Título Padrão';
  backendUrl = 'http://localhost:8080';
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {

    this.productService.getProductsPage({ limit: 6 }).subscribe({
      next: (data) => {
        this.products = data.items;
      },
      error: (err) =>
        console.error('Erro ao buscar produtos em destaque:', err),
    });
  }
}
