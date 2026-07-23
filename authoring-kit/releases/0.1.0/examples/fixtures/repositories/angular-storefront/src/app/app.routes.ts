import { Routes } from '@angular/router';
import { signedInGuard } from './auth/signed-in.guard';

export const routes: Routes = [
  {
    path: 'checkout',
    canActivate: [signedInGuard],
    loadComponent: () =>
      import('./checkout/checkout-page.component').then(
        (module) => module.CheckoutPageComponent,
      ),
  },
];
