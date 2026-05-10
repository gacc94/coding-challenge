import { computed, Injectable, signal } from '@angular/core';
import type { FactorizationResponse } from '../models/matrix.model';

@Injectable({ providedIn: 'root' })
export class FactorizationState {
  readonly response = signal<FactorizationResponse | null>(null);
  readonly hasData = computed(() => this.response() !== null);

  set(data: FactorizationResponse): void {
    this.response.set(data);
  }

  clear(): void {
    this.response.set(null);
  }
}
