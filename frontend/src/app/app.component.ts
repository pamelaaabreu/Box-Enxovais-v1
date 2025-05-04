import { Component, ViewEncapsulation, } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterModule,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})

export class AppComponent {
  title = 'frontend';
}


