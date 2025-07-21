import { Component } from '@angular/core';
import { ProductService } from '../services/product.service'
import { Produto } from '../shared/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-register',
  imports: [FormsModule],
  templateUrl: './product-register.component.html',
  styleUrl: './product-register.component.css'
})
export class ProductRegisterComponent {
 produto: Partial<Produto> = {};
  selectedFile: File | null = null;

  constructor(private productService: ProductService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  cadastrarProduto() {
    if (!this.produto.name || !this.produto.price) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.produto.name!);
    formData.append('description', this.produto.description || '');
    formData.append('price', this.produto.price!.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productService.cadastrarProduto(formData).subscribe({
      next: (res) => {
        console.log('Produto cadastrado!', res);
      },
      error: (err) => {
        console.error('Erro ao cadastrar:', err);
      },
    });
  }

}
