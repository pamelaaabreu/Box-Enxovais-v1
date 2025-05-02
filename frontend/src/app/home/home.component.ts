import { Component, ViewEncapsulation} from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from '../footer/footer.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';
import { CardsComponent } from '../cards/cards.component';
import { ProdutosDestaqueComponent } from "../produtos-destaque/produtos-destaque.component";

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, FooterComponent, CarouselModule, CommonModule, CardsComponent, ProdutosDestaqueComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent {



}
