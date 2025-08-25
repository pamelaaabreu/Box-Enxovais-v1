import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../../shared/models';
import { PromoService } from '../../core/services/promo.service';
import { CurrencyPipe, DecimalPipe, CommonModule} from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-promo-grid',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, DecimalPipe, CommonModule],
  templateUrl: './promo-grid.component.html',
  styleUrl: './promo-grid.component.css',
})
export class PromoGridComponent implements OnInit {
  promotionalProducts: Product[] = [];
  @Input() promoName?: string;

  constructor(private promoService: PromoService) {}

  ngOnInit(): void {
    if (this.promoName) {
      this.promoService.getPromotionalProducts(this.promoName).subscribe({
        next: (data) => {
           console.log('Dados recebidos do backend:', data);
          this.promotionalProducts = data;    
        },
        error: (err) => {
          console.error('Erro ao buscar promoções', err);
        },
      });
    }
  }
}