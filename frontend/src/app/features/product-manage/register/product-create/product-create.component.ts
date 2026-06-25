import { Component, EventEmitter, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Product } from '../../../../shared/models';

import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductCreateComponent {
  @Output() productCreated = new EventEmitter<number>();

  loading = false;

  product: Product = {
    name: '',
    price: 0,
    promotional_price: 0,
    quantity: 0,
    status: 'active',

    measurements: {
      casal: '',
      queen: '',
      super_king: '',
      solteiro: '',
    },

    description: '',
    care_instructions: '',
  };

  constructor(private productService: ProductService) {}

  onSubmit(): void {
    this.loading = true;

    this.productService.createProduct(this.product).subscribe({
      next: (response) => {
        this.loading = false;

        this.product.id = response.id;

        // envia o ID para o componente pai
        this.productCreated.emit(response.id);
      },

      error: () => {
        this.loading = false;

        alert('Erro ao criar o produto.');
      },
    });
  }
}
