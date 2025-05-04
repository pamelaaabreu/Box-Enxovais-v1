import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-minha-conta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './minha-conta.component.html',
  styleUrl: './minha-conta.component.css'
})
export class MinhaContaComponent {
  constructor(public router: Router) {}

  isMainPage(): boolean {
    return this.router.url === '/minha-conta';
  }
}
