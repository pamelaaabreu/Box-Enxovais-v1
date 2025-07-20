import { Component, OnInit } from '@angular/core';
import { TituloDecoradoComponent } from '../titulo-decorado/titulo-decorado.component';
import { ProductService } from '../services/product.service';
import { Produto } from '../shared/models';
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-featured-products',
  imports: [TituloDecoradoComponent, DecimalPipe, CommonModule],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
  produtos: Produto[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.productService.getProdutos().subscribe((data) => {
      this.produtos = data;
    });
  }
}
