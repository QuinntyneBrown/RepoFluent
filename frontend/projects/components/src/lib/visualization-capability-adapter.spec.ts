import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { VisualizationCapabilityAdapter } from './visualization-capability-adapter';

describe('VisualizationCapabilityAdapter', () => {
  it('selects and reports the semantic fallback when GPU policy is disabled', async () => {
    const document = TestBed.inject(DOCUMENT);
    const adapter = TestBed.inject(VisualizationCapabilityAdapter);
    const originalUrl = document.location.href;
    let capabilityEvent: unknown;
    document.defaultView?.history.replaceState({}, '', '/?gpu=off');
    document.defaultView?.addEventListener(
      'repofluent:capability',
      (event) => {
        capabilityEvent = (event as CustomEvent).detail;
      },
      { once: true },
    );

    await adapter.initialize();

    expect(adapter.state()).toBe('fallback');
    expect(document.documentElement.dataset['rfVisualizationCapability']).toBe('fallback');
    expect(capabilityEvent).toEqual({
      capability: 'webgpu',
      mode: 'fallback',
      reason: 'policy-disabled',
    });
    document.defaultView?.history.replaceState({}, '', originalUrl);
  });
});
