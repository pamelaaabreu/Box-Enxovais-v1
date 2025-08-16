import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models';
import { CommonModule, CurrencyPipe } from '@angular/common';
// import { TituloDecoradoComponent } from '../titulo-decorado/titulo-decorado.component';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
  product: Product | null = null;
  backendUrl = 'http://localhost:8080';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Para este exemplo, vamos buscar o produto com ID = 1
    const featuredProductId = 3;

    this.productService.getProduct(featuredProductId).subscribe({
      next: (data) => {
        this.product = data;
        console.log('Produto em destaque carregado:', this.product);
      },
      error: (err) => console.error('Erro ao buscar produto em destaque:', err),
    });
  }
}
