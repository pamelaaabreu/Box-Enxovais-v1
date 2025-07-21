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
}
