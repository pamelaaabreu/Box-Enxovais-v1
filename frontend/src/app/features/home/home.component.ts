import { Component, ViewEncapsulation } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';
import { MainNavbarComponent } from '../../components/main-navbar/main-navbar.component';
import { CarouselComponent } from "../../components/carousel/carousel.component";
import { TopWelcomeHeaderComponent } from "../../components/top-welcome-header/top-welcome-header.component";
import { TopNavbarComponent } from "../../components/top-navbar/top-navbar.component";
import { FeaturedProductsComponent } from "../featured-products/featured-products.component";
// import { FeaturedProductsComponent } from '../featured-products/featured-products.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    // NavbarComponent,
    FooterComponent,
    CarouselModule,
    CommonModule,
    MainNavbarComponent,
    CarouselComponent,
    TopWelcomeHeaderComponent,
    TopNavbarComponent,
    FeaturedProductsComponent
],
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})

export class HomeComponent {}
