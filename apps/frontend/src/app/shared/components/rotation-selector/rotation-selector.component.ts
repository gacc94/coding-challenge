import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ROTATION_OPTIONS, type RotationType } from '../../../core/models/rotation.types';

@Component({
  selector: 'gacc-rotation-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rotation-selector' },
  template: `
    <mat-form-field class="rotation-selector__field" appearance="outline">
      <mat-label>Rotation Type</mat-label>
      <mat-select
        [value]="rotation()"
        (selectionChange)="rotationChange.emit($event.value)">
        @for (opt of options; track opt.value) {
          <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: `.rotation-selector__field { min-width: 320px; }`,
})
export class RotationSelectorComponent {
  rotation = input<RotationType>('none');
  rotationChange = output<RotationType>();
  protected readonly options = ROTATION_OPTIONS;
}
