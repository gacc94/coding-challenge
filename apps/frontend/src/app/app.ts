import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { APP_VERSION, APP_BUILD } from '../environments/version';

@Component({
  selector: 'gacc-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    const meta = inject(Meta);
    meta.addTag({ name: 'app-version', content: APP_VERSION });
    meta.addTag({ name: 'app-build', content: APP_BUILD });
  }
}
