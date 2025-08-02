import { Component, ViewEncapsulation } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';
// import { FeaturedProductsComponent } from '../featured-products/featured-products.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    NavbarComponent,
    FooterComponent,
    CarouselModule,
    CommonModule,
],
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})

export class HomeComponent {}
