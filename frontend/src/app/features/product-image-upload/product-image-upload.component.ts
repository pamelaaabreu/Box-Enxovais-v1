import { Component } from '@angular/core';
import { UploadService } from '../../core/services/upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-product-image-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-image-upload.component.html',
  styleUrl: './product-image-upload.component.css',
})
export class ProductImageUploadComponent {
  selectedFile: File | null = null;
  productId: string = 'PROD-123';
  uploadResponse: string = '';

  constructor(private uploadService: UploadService) {}

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
    formData.append('productId', this.productId);

    this.uploadService.uploadImage(formData).subscribe({
      next: (res) => {
        console.log(res);
        this.uploadResponse = `Sucesso! Arquivo salvo em: ${res.filePath}`;
      },
      error: (err) => {
        console.error(err);
        this.uploadResponse = `Erro: ${err.error}`;
      },
    });
  }
}
