import { Component, OnInit } from '@angular/core';
import { TituloDecoradoComponent } from '../titulo-decorado/titulo-decorado.component';
import { ProductService } from '../services/product.service';
import { Produto } from '../shared/models';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-featured-products',
  imports: [TituloDecoradoComponent, DecimalPipe, CommonModule, CarouselModule],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
  produto: Produto[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.carregarProduto();
  }

  carregarProduto() {
    this.productService.getProduto().subscribe((data) => {
      this.produto = data;
    });
  }

    customOptions: OwlOptions = {
    loop: true,
    margin: 16,
    nav: true,
    dots: true,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 },
    },
    navText: ['‹', '›'],
  };
}
