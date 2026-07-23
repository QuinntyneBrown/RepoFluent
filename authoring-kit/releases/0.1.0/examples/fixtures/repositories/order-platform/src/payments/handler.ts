export function authorizePayment(orderId: string): string {
  return `authorized:${orderId}`;
}
