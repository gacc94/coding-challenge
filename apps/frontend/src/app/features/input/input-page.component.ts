import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { formatApiError, getErrorCode, type ApiErrorCode } from '../../core/http/api-error';
import { API_URL } from '../../core/http/api-url.token';
import type { FactorizationResponse } from '../../core/models/matrix.model';
import type { RotationType } from '../../core/models/rotation.types';
import { FactorizationState } from '../../core/state/factorization.state';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { RotationSelectorComponent } from '../../shared/components/rotation-selector/rotation-selector.component';

const MIN_DIM = 1;
const MAX_DIM = 10;
const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

@Component({
  selector: 'gacc-input-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    RotationSelectorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './input-page.component.html',
  styleUrl: './input-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPage {
  protected readonly auth = inject(AuthService);
  private readonly apiUrl = inject(API_URL);
  private readonly state = inject(FactorizationState);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rows = signal(DEFAULT_ROWS);
  protected readonly cols = signal(DEFAULT_COLS);
  protected readonly rotation = signal<RotationType>('none');
  protected readonly cells = signal<number[][]>(this.buildMatrix(DEFAULT_ROWS, DEFAULT_COLS));
  private readonly trigger = signal(0);

  protected readonly errorCode = signal<ApiErrorCode | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly rowError = signal<string | null>(null);
  protected readonly colError = signal<string | null>(null);

  protected readonly isComplete = computed(() => {
    const m = this.cells();
    if (!m.length || !m[0]?.length) return false;
    return m.every((row) =>
      row.every((v) => typeof v === 'number' && !Number.isNaN(v) && v !== null),
    );
  });

  protected readonly filledCount = computed(() => {
    const m = this.cells();
    if (!m.length || !m[0]?.length) return 0;
    let count = 0;
    for (const row of m) {
      for (const v of row) {
        if (typeof v === 'number' && !Number.isNaN(v) && v !== null) count++;
      }
    }
    return count;
  });

  protected readonly totalElements = computed(() => this.rows() * this.cols());

  protected readonly flatCells = computed(() => {
    const m = this.cells();
    const flat: number[] = [];
    for (const row of m) {
      for (const v of row) {
        flat.push(v);
      }
    }
    return flat;
  });

  /* ── Track functions (unique per cell via flat index) ─── */

  protected readonly trackRow = (_i: number): number => _i;
  protected readonly trackCell = (_j: number): number => _j;

  /* ── HTTP resource ────────────────────────────── */

  protected readonly qrResource = httpResource<FactorizationResponse>(() => {
    const t = this.trigger();
    if (t === 0) return undefined;
    return {
      url: `${this.apiUrl}/api/v1/qr-factorization`,
      method: 'POST',
      body: { matrix: this.cells(), rotation: this.rotation() },
    };
  });

  private readonly _onSuccess = effect(() => {
    const data = this.qrResource.value();
    if (data) {
      untracked(() => {
        this.state.set(data);
        this.router.navigate(['/results']);
      });
    }
  });

  private readonly _onError = effect(() => {
    const err = this.qrResource.error();
    if (err) {
      const code = getErrorCode(err);
      const msg = formatApiError(err);
      untracked(() => {
        this.errorCode.set(code);
        this.errorMessage.set(msg);
        this.snackBar.open(msg, 'Close', { duration: 8000, panelClass: 'error-snackbar' });
      });
    }
  });

  /* ── Grid builders ────────────────────────────── */

  private buildMatrix(r: number, c: number): number[][] {
    return Array.from({ length: r }, () => new Array(c).fill(0));
  }

  private preserveValues(newRows: number, newCols: number, old: number[][]): number[][] {
    const result = this.buildMatrix(newRows, newCols);
    for (let i = 0; i < Math.min(newRows, old.length); i++) {
      for (let j = 0; j < Math.min(newCols, old[i]?.length ?? 0); j++) {
        result[i][j] = old[i][j];
      }
    }
    return result;
  }

  /* ── Handlers ─────────────────────────────────── */

  onRowsChange(value: string): void {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n < MIN_DIM) {
      this.rowError.set(`Rows must be at least ${MIN_DIM}.`);
      return;
    }
    if (n > MAX_DIM) {
      this.rowError.set(`Rows cannot exceed ${MAX_DIM}.`);
      return;
    }
    if (n < this.cols()) {
      this.rowError.set('Rows must be \u2265 columns for QR factorization.');
      return;
    }
    this.rowError.set(null);
    this.clearError();
    this.rows.set(n);
    this.cells.update((old) => this.preserveValues(n, this.cols(), old));
  }

  onColsChange(value: string): void {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n < MIN_DIM) {
      this.colError.set(`Columns must be at least ${MIN_DIM}.`);
      return;
    }
    if (n > MAX_DIM) {
      this.colError.set(`Columns cannot exceed ${MAX_DIM}.`);
      return;
    }
    if (n > this.rows()) {
      this.colError.set('Columns must be \u2264 rows for QR factorization.');
      return;
    }
    this.colError.set(null);
    this.clearError();
    this.cols.set(n);
    this.cells.update((old) => this.preserveValues(this.rows(), n, old));
  }

  onCellChange(rowIdx: number, colIdx: number, value: string): void {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    this.clearError();
    this.cells.update((matrix) => {
      const copy = matrix.map((r) => [...r]);
      copy[rowIdx][colIdx] = num;
      return copy;
    });
  }

  calculate(): void {
    this.clearError();

    if (this.rows() < this.cols()) {
      this.errorMessage.set('Rows must be \u2265 columns for QR factorization.');
      this.errorCode.set('VALIDATION_ERROR');
      return;
    }

    if (!this.isComplete()) {
      this.snackBar.open('Complete all matrix cells before submitting.', 'Close', {
        duration: 4000,
      });
      return;
    }

    this.trigger.update((t) => t + 1);
  }

  clearError(): void {
    this.errorCode.set(null);
    this.errorMessage.set(null);
  }
}
