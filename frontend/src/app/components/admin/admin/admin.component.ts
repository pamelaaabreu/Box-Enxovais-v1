import { Component, HostListener, OnInit } from '@angular/core'; // Adicionado OnInit
import {
  Router,
  NavigationEnd,
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
export class AdminComponent implements OnInit { // Implementa OnInit
  isSidebarCollapsed: boolean = false;
  isProductMenuOpen: boolean = false;
  isPromotionMenuOpen: boolean = false;

  isMobile: boolean = false;
  private readonly mobileBreakpoint: number = 768;

  constructor(private router: Router) {}

  // CORREÇÃO: ngOnInit deve ser um método público do componente
  ngOnInit(): void { 
    this.checkMobileStatus();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;

        // Lógica para manter Dropdowns Abertos na rota correta
        this.isProductMenuOpen = url.includes('/product'); // Ajustado para ser mais flexível se "/admin" for opcional
        this.isPromotionMenuOpen = url.includes('/promotion');

        // Lógica de fechar a sidebar no mobile após navegação
        if (this.isMobile) {
          this.isSidebarCollapsed = false;
        }
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkMobileStatus();
  }

  private checkMobileStatus(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= this.mobileBreakpoint;

    // Se saiu do mobile para desktop, ou vice-versa, ajusta o estado padrão
    if (wasMobile !== this.isMobile && !this.isMobile) {
      // Se estamos em desktop, garante que o estado é o de não-translação (aberto ou colapsado, dependendo da preferência)
      this.isSidebarCollapsed = false; 
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

    // Se a sidebar colapsou no desktop, feche os submenus
    // Nota: Em mobile, esta função ABRE a sidebar
    if (this.isSidebarCollapsed && !this.isMobile) {
      this.isProductMenuOpen = false;
      this.isPromotionMenuOpen = false;
    }
  }

  toggleProductMenu(event: Event): void {
    event.preventDefault();
    this.isProductMenuOpen = !this.isProductMenuOpen;
    if (this.isProductMenuOpen) {
      this.isPromotionMenuOpen = false;
    }
  }

  togglePromotionMenu(event: Event): void {
    event.preventDefault();
    this.isPromotionMenuOpen = !this.isPromotionMenuOpen;
    if (this.isPromotionMenuOpen) {
      this.isProductMenuOpen = false;
    }
  }
}