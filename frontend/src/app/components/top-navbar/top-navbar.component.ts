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
  styleUrl: './top-navbar.component.css',
})
export class TopNavbarComponent implements OnInit {
  @Input() isScrolled: boolean = false;
  isLoggedIn = false;
  isMenuOpen = false;
  userName: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    // this.isLoggedIn = true;
    if (this.isLoggedIn) {
      const fullName = this.authService.getUserName();
      if (fullName) {
        this.userName = fullName.split(' ')[0];
      }
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Menu state:', this.isMenuOpen);
  }

  logout(): void {
    this.isMenuOpen = false;
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = null;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }
}
