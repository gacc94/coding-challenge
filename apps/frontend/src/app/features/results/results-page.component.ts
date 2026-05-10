import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { FactorizationState } from '../../core/state/factorization.state';
import { MatrixDisplayComponent } from './components/matrix-display/matrix-display.component';
import { StatsPanelComponent } from './components/stats-panel/stats-panel.component';

@Component({
  selector: 'gacc-results-page',
  standalone: true,
  imports: [
    RouterLink, MatToolbarModule, MatButtonModule, MatIconModule,
    MatrixDisplayComponent, StatsPanelComponent,
  ],
  templateUrl: './results-page.component.html',
  styleUrl: './results-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPage {
  protected readonly auth = inject(AuthService);
  private readonly state = inject(FactorizationState);
  private readonly router = inject(Router);

  protected readonly response = this.state.response;

  constructor() {
    effect(() => {
      if (!this.response()) {
        this.router.navigate(['/input']);
      }
    });
  }
}
