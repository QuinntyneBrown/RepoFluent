import { Injectable, inject, signal } from '@angular/core';
import { CheckoutService } from './checkout.service';

@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  private readonly service = inject(CheckoutService);
  readonly status = signal<'idle' | 'submitting' | 'complete'>('idle');

  submit(order: { sku: string; quantity: number }): void {
    this.status.set('submitting');
    this.service.submit(order).subscribe(() => this.status.set('complete'));
  }
}
