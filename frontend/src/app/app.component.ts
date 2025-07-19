import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Isso faz o AppComponent standalone
  imports: [RouterOutlet], // ✅ RouterOutlet para renderizar rotas
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AppComponent {
  title = 'frontend';

   navbar: HTMLElement | null = null;

  ngAfterViewInit() {
    this.navbar = document.querySelector('.navbar');
  }

    @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.navbar) return;

    if (window.scrollY > 100) {
      this.navbar.classList.add('hidden');
    } else {
      this.navbar.classList.remove('hidden');
    }
  }
}
