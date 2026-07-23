import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { BrowserCapabilityAdapter } from './browser-capability-adapter';

describe('BrowserCapabilityAdapter', () => {
  it('publishes the approved policy and a coarse supported outcome', () => {
    const document = TestBed.inject(DOCUMENT);
    const originalCss = window.CSS;
    const originalShowModal = window.HTMLDialogElement.prototype.showModal;
    Object.defineProperty(window, 'CSS', {
      configurable: true,
      value: { supports: () => true },
    });
    Object.defineProperty(window.HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: () => undefined,
    });
    const adapter = TestBed.inject(BrowserCapabilityAdapter);
    let outcome: Record<string, unknown> | null = null;
    const capture = (event: Event): void => {
      outcome = (event as CustomEvent).detail as Record<string, unknown>;
    };
    window.addEventListener('repofluent:experience-outcome', capture);

    adapter.initialize();

    expect(document.documentElement.dataset['rfBrowserPolicy']).toBe(
      'angular-21-baseline-2025-10-20',
    );
    expect(document.documentElement.dataset['rfBrowserSupport']).toBe('supported');
    expect(outcome).toEqual({
      kind: 'browser-capability',
      outcome: 'supported',
      policyId: 'angular-21-baseline-2025-10-20',
      presentation: 'full',
    });
    window.removeEventListener('repofluent:experience-outcome', capture);
    Object.defineProperty(window, 'CSS', { configurable: true, value: originalCss });
    Object.defineProperty(window.HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: originalShowModal,
    });
  });

  it('selects safe fallback without recording browser fingerprint details', () => {
    const document = TestBed.inject(DOCUMENT);
    const originalUrl = document.location.href;
    document.defaultView?.history.replaceState({}, '', '?browser=unsupported');
    const adapter = TestBed.inject(BrowserCapabilityAdapter);
    let outcome: Record<string, unknown> | null = null;
    const capture = (event: Event): void => {
      outcome = (event as CustomEvent).detail as Record<string, unknown>;
    };
    window.addEventListener('repofluent:experience-outcome', capture);

    adapter.initialize();

    expect(adapter.state()).toBe('unsupported');
    expect(document.documentElement.dataset['rfMotion']).toBe('reduced');
    expect(Object.keys(outcome!).sort()).toEqual(['kind', 'outcome', 'policyId', 'presentation']);
    expect(JSON.stringify(outcome)).not.toMatch(/userAgent|platform|language|screen|hardware/i);

    window.removeEventListener('repofluent:experience-outcome', capture);
    document.defaultView?.history.replaceState({}, '', originalUrl);
  });
});
