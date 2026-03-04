import { Component } from '@angular/core';
import { UploadService } from '../../core/services/upload.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-image-upload.component.html',
  styleUrl: './product-image-upload.component.css',
})
export class ProductImageUploadComponent {
  selectedFile: File | null = null;
  productId!: string; // <-- agora é dinâmico
  uploadResponse: string = '';

  constructor(
    private uploadService: UploadService,
    private route: ActivatedRoute // <-- importa a rota
  ) {}

  ngOnInit(): void {
    // ✅ pega o ID vindo da URL: /admin/product/image-upload/20
    this.productId = this.route.snapshot.paramMap.get('id')!;
    console.log('ID recebido:', this.productId);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert('Por favor, selecione um arquivo primeiro.');
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    formData.append('productId', this.productId); // ✅ envia o ID correto

    this.uploadService.uploadImage(formData).subscribe({
      next: (res) => {
        this.uploadResponse = `Sucesso! Arquivo salvo em: ${res.filePath}`;
      },
      error: (err) => {
        console.error(err);
        this.uploadResponse = `Erro: ${err.error}`;
      },
    });
  }
}
