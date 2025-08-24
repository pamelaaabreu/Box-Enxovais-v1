import { Component } from '@angular/core';
import { Product } from '../../shared/models';
import { ProductService } from '../../core/services/product.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductCreateComponent {
  product: Product = {
    name: '',
    price: 0,
    promotionalPrice: 0,
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

  constructor(private productService: ProductService, private router: Router) {}

  onSubmit(): void {
    this.productService.createProduct(this.product).subscribe({
      next: (response) => {
        console.log('Produto criado com sucesso!', response);
        alert(`Produto "${this.product.name}" criado com ID: ${response.id}`);

        this.router.navigate(['/image-upload', response.id]);
      },
      error: (err) => {
        console.error('Erro ao criar produto:', err);
        alert('Ocorreu um erro ao criar o produto.');
      },
    });
  }
}
