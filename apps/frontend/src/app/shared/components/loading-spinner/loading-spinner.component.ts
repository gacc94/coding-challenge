import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'gacc-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'loading-spinner' },
  template: `
    <div class="loading-spinner__overlay">
      <mat-spinner class="loading-spinner__circle" [diameter]="diameter()" />
      @if (message()) {
        <p class="loading-spinner__message">{{ message() }}</p>
      }
    </div>
  `,
  styles: `
    .loading-spinner__overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      gap: 16px;
    }
    .loading-spinner__message {
      font-size: 14px;
      color: #7a7a7a;
      margin: 0;
    }
  `,
})
export class LoadingSpinnerComponent {
  diameter = input(40);
  message = input<string>();
}
