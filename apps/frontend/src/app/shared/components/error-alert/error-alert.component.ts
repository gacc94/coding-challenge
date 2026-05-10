import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'gacc-error-alert',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'error-alert' },
  template: `
    <mat-card class="error-alert__card">
      <mat-card-content class="error-alert__content">
        <mat-icon class="error-alert__icon">error_outline</mat-icon>
        <div class="error-alert__body">
          <p class="error-alert__message">{{ error() }}</p>
          @if (retry) {
            <button class="error-alert__retry" mat-stroked-button color="warn"
                    (click)="retry.emit()">
              <mat-icon>refresh</mat-icon> Retry
            </button>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .error-alert__card {
      border: 1px solid var(--mat-sys-error);
      border-radius: 18px;
      margin: 16px 0;
    }
    .error-alert__content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .error-alert__icon { color: var(--mat-sys-error); }
    .error-alert__body { flex: 1; }
    .error-alert__message {
      margin: 0;
      font-size: 14px;
      color: var(--mat-sys-error);
    }
    .error-alert__retry { margin-top: 8px; }
  `,
})
export class ErrorAlertComponent {
  error = input.required<string>();
  retry = output<void>();
}
