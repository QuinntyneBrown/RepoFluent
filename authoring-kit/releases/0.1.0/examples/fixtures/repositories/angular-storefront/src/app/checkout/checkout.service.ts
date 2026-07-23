import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);

  submit(order: { sku: string; quantity: number }) {
    return this.http.post(`${environment.ordersApi}/orders`, order);
  }
}
