import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css'],
})
export class TopNavbarComponent implements OnInit {
  @Input() isScrolled: boolean = false;

  isLoggedIn = false;
  isMenuOpen = false;
  userName: string | null = null;
  isLoading: boolean = true;
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Carrega usuário do storage e atualiza estado
    this.authService.loadUser().then(() => {
      this.updateUserInfo();
      this.isLoading = false;
    });

    // Atualiza se houver mudança no usuário
    this.authService.userChanged.subscribe(() => this.updateUserInfo());
  }

  updateUserInfo(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userName = this.authService.getUserName()?.split(' ')[0] || null;

    // Verifica se o usuário é admin
    const role =
      localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    this.isAdmin = role === 'admin';
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.isMenuOpen = false;
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = null;
    this.isAdmin = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }
}
