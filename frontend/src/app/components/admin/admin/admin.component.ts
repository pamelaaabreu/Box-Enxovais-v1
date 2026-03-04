import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  isSidebarCollapsed = false;
  isProductMenuOpen = false;
  isPromotionMenuOpen = false;

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => this.collapseAllMenus());
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleProductMenu(event: Event): void {
    event.stopPropagation();
    this.isProductMenuOpen = !this.isProductMenuOpen;
  }

  togglePromotionMenu(event: Event): void {
    event.stopPropagation();
    this.isPromotionMenuOpen = !this.isPromotionMenuOpen;
  }

  collapseAllMenus(): void {
    this.isProductMenuOpen = false;
    this.isPromotionMenuOpen = false;
  }
}
