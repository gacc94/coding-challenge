import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { StatsResponse } from '../../../../core/models/matrix.model';

@Component({
  selector: 'gacc-stats-panel',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'stats-panel' },
  template: `
    <h2 class="stats-panel__heading">Estadisticas Globales</h2>
    <div class="stats-panel__grid">
      <div class="stats-panel__item">
        <span class="stats-panel__label">Maximo</span>
        <span class="stats-panel__value">{{ stats()?.max | number:'1.0-4' }}</span>
      </div>
      <div class="stats-panel__item">
        <span class="stats-panel__label">Minimo</span>
        <span class="stats-panel__value">{{ stats()?.min | number:'1.0-4' }}</span>
      </div>
      <div class="stats-panel__item">
        <span class="stats-panel__label">Promedio</span>
        <span class="stats-panel__value">{{ stats()?.average | number:'1.0-4' }}</span>
      </div>
      <div class="stats-panel__item">
        <span class="stats-panel__label">Suma</span>
        <span class="stats-panel__value">{{ stats()?.sum | number:'1.0-4' }}</span>
      </div>
      <div class="stats-panel__item">
        <span class="stats-panel__label">Elementos</span>
        <span class="stats-panel__value">{{ stats()?.totalElements }}</span>
      </div>
      <div class="stats-panel__item">
        <span class="stats-panel__label">Matrices</span>
        <span class="stats-panel__value">{{ stats()?.numberOfMatrices }}</span>
      </div>
    </div>
    @if (stats()?.diagonalMatrices?.count) {
      <div class="stats-panel__diagonals">
        <h3 class="stats-panel__diagonal-heading">
          Matrices Diagonales ({{ stats()?.diagonalMatrices?.count }})
        </h3>
        <div class="stats-panel__chip-list">
          @for (m of stats()?.diagonalMatrices?.matrices; track m.matrixIndex) {
            <span class="stats-panel__chip">{{ m.name }} — {{ m.dimensions }}</span>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .stats-panel__heading { font-size: 32px; font-weight: 600; margin: 0 0 24px; }
    .stats-panel__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
    .stats-panel__item { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: rgba(255,255,255,0.06); border-radius: 11px; }
    .stats-panel__label { font-size: 14px; color: #ccc; }
    .stats-panel__value { font-size: 17px; font-weight: 600; color: #fff; }
    .stats-panel__diagonals { margin-top: 24px; }
    .stats-panel__diagonal-heading { font-size: 17px; font-weight: 600; color: #fff; margin: 0 0 12px; }
    .stats-panel__chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .stats-panel__chip { padding: 8px 14px; background: rgba(255,255,255,0.08); border-radius: 9999px; font-size: 14px; color: #2997ff; }
  `,
})
export class StatsPanelComponent {
  stats = input<StatsResponse | null>();
}
