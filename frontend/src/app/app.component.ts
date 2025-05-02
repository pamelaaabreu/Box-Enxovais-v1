import { Component, ViewEncapsulation, } from '@angular/core';
import { HomeComponent } from './home/home.component';


@Component({
  selector: 'app-root',
  imports: [HomeComponent,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})

export class AppComponent {
  title = 'frontend';
}


