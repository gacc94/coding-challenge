import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'gacc-matrix-display',
  standalone: true,
  imports: [DecimalPipe, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'matrix-display',
    '[class.matrix-display--highlight]': 'highlight()',
  },
  template: `
    <mat-card class="matrix-display__card">
      @if (title()) {
        <mat-card-header>
          <mat-card-title class="matrix-display__title">{{ title() }}</mat-card-title>
          <mat-card-subtitle class="matrix-display__dimensions">
            {{ dimensions() }}
          </mat-card-subtitle>
        </mat-card-header>
      }
      <mat-card-content class="matrix-display__content">
        <table class="matrix-display__table">
          @for (row of data(); track rowIdx; let rowIdx = $index) {
            <tr>
              @for (val of row; track colIdx; let colIdx = $index) {
                <td class="matrix-display__cell">{{ val | number:'1.0-4' }}</td>
              }
            </tr>
          }
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .matrix-display__card {
      border-radius: 18px;
      border: 1px solid var(--mat-sys-outline-variant);
    }
    .matrix-display--highlight .matrix-display__card {
      border-color: var(--mat-sys-primary);
      border-width: 2px;
    }
    .matrix-display__title { font-size: 14px; font-weight: 600; }
    .matrix-display__dimensions { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .matrix-display__table { width: 100%; border-collapse: collapse; }
    .matrix-display__cell {
      padding: 8px 12px;
      text-align: center;
      border: 1px solid var(--mat-sys-outline-variant);
      font-variant-numeric: tabular-nums;
      font-size: 14px;
    }
  `,
})
export class MatrixDisplayComponent {
  data = input.required<number[][]>();
  title = input<string>();
  highlight = input(false, { transform: (v: unknown) => v === '' || v === true });

  protected readonly dimensions = computed(() => {
    const d = this.data();
    return `${d.length} × ${d[0]?.length ?? 0}`;
  });
}
