import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import type { VisualizationCapabilityState } from './visualization-capability-state';

@Injectable({ providedIn: 'root' })
export class VisualizationCapabilityAdapter {
  private readonly document = inject(DOCUMENT);

  readonly state = signal<VisualizationCapabilityState>('probing');
  readonly reason = signal('probing');

  async initialize(timeoutMilliseconds = 250): Promise<void> {
    const policy = new URLSearchParams(this.document.location.search).get('gpu');
    if (policy === 'off') {
      this.select('fallback', 'policy-disabled');
      return;
    }
    if (policy === 'fail') {
      this.select('fallback', 'initialization-failed');
      return;
    }

    const view = this.document.defaultView;
    const gpu = (
      view?.navigator as
        | (Navigator & {
            gpu?: { requestAdapter: () => Promise<object | null> };
          })
        | undefined
    )?.gpu;
    if (!gpu) {
      this.select('fallback', 'unsupported');
      return;
    }

    try {
      const adapter = await Promise.race([
        gpu.requestAdapter(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMilliseconds)),
      ]);
      this.select(
        adapter ? 'enhanced' : 'fallback',
        adapter ? 'available' : 'timeout-or-unavailable',
      );
    } catch {
      this.select('fallback', 'initialization-failed');
    }
  }

  private select(state: VisualizationCapabilityState, reason: string): void {
    this.state.set(state);
    this.reason.set(reason);
    this.document.documentElement.dataset['rfVisualizationCapability'] = state;
    this.document.defaultView?.dispatchEvent(
      new CustomEvent('repofluent:capability', {
        detail: {
          capability: 'webgpu',
          mode: state,
          reason,
        },
      }),
    );
  }
}
