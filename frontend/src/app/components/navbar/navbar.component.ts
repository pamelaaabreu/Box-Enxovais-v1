import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class NavbarComponent {
  
}
