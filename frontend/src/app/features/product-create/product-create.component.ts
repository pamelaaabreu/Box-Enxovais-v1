import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Product } from '../../shared/models';
import { ProductService } from '../../core/services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductCreateComponent {
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

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    this.loading = true;

    this.productService.createProduct(this.product).subscribe({
      next: (response) => {
        this.loading = false;
        this.product.id = response.id;

        this.router.navigate([`/admin/product/image-upload/${response.id}`]);
      },
      error: () => {
        this.loading = false;
        alert('Erro ao criar o produto.');
      },
    });
  }
}
