import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CheckoutStore } from './checkout.store';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent {
  private readonly store = inject(CheckoutStore);

  submit(): void {
    this.store.submit({ sku: 'fixture-sku', quantity: 1 });
  }
}
