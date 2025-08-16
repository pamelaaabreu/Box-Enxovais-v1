import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductImageUploadComponent } from "./features/product-image-upload/product-image-upload.component";

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Isso faz o AppComponent standalone
  imports: [RouterOutlet, ProductImageUploadComponent], // ✅ RouterOutlet para renderizar rotas
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AppComponent {
  title = 'frontend';
}
