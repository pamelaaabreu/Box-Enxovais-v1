import { Component } from '@angular/core';
import { ProductCreateComponent } from '../../../features/product-create/product-create.component';
import { ProductImageUploadComponent } from '../../../features/product-image-upload/product-image-upload.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ProductCreateComponent, ProductImageUploadComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {

}
