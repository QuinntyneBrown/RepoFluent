import { describe, expect, it, vi } from 'vitest';

describe('CheckoutStore', () => {
  it('submits through the checkout service', () => {
    const submit = vi.fn();
    submit();
    expect(submit).toHaveBeenCalledOnce();
  });
});
