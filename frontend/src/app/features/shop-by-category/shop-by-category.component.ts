import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shop-by-category',
  imports: [],
  templateUrl: './shop-by-category.component.html',
  styleUrl: './shop-by-category.component.css'
})
export class ShopByCategoryComponent {
  @Input() titulo: string = 'Título Padrão';
}
