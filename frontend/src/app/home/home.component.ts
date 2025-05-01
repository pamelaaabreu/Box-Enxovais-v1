import { Component, ViewEncapsulation} from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from '../footer/footer.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, FooterComponent, CarouselModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent {

  produtos = [
    {
      nome: 'Camisa X',
      descricao: 'Camisa 100% algodão, confortável.',
      preco: 79.99,
      imagem: 'assets/camisa.jpg'
    },
    {
      nome: 'Tênis Y',
      descricao: 'Tênis leve e resistente.',
      preco: 189.90,
      imagem: 'assets/tenis.jpg'
    },
    // ...mais produtos
  ];
  

}
