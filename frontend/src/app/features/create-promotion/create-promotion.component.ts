import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatePromotionRequest } from '../../shared/models';
import { PromoService } from '../../core/services/promo.service';

@Component({
  selector: 'app-create-promotion',
  templateUrl: './create-promotion.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class CreatePromotionComponent {
  promotionData: CreatePromotionRequest = {
    name: '',
    status: 'active',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date().toISOString().slice(0, 16)
  };

  constructor(private promoService: PromoService) { }

  onSubmit(): void {
    this.promoService.createPromotion(this.promotionData).subscribe({
      next: (response) => {
        console.log('Promoção criada com sucesso:', response);
        alert('Promoção criada com sucesso!');
        this.resetForm();
      },
      error: (error) => {
        console.error('Erro ao criar promoção:', error);
        alert('Erro ao criar promoção. Verifique o console para mais detalhes.');
      }
    });
  }

  resetForm(): void {
    this.promotionData = {
      name: '',
      status: 'active',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date().toISOString().slice(0, 16)
    };
  }
}