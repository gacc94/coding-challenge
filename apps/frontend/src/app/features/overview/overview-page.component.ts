import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth/auth.service';

const EXAMPLE_MATRIX: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const ROTATED_EXAMPLE: number[][] = [
  [7, 4, 1],
  [8, 5, 2],
  [9, 6, 3],
];

interface Metric {
  value: string;
  label: string;
  sublabel: string;
}

const METRICS: Metric[] = [
  { value: '0.4ms', label: 'Processing Time', sublabel: 'Average per operation' },
  {
    value: 'O(N)',
    label: 'Complexity',
    sublabel: 'Gram-Schmidt Modified',
  },
  { value: '100%', label: 'Test Coverage', sublabel: 'Validated across scenarios' },
];

const ROTATION_CHIPS: string[] = [
  '90\u00B0 CW',
  '180\u00B0',
  '270\u00B0 CW',
  'Transpose',
  'Flip H',
  'Flip V',
  'None',
];

@Component({
  selector: 'gacc-overview-page',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  protected readonly auth = inject(AuthService);

  protected readonly exampleMatrix = signal(EXAMPLE_MATRIX);
  protected readonly rotatedExample = signal(ROTATED_EXAMPLE);
  protected readonly metrics = signal(METRICS);
  protected readonly rotationChips = signal(ROTATION_CHIPS);

  protected readonly trackMetric = (_idx: number, m: Metric): string => m.label;
  protected readonly trackChip = (_idx: number, c: string): string => c;
  protected readonly trackCell = (idx: number): number => idx;
}
