import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { approvedBrowserSupportPolicy } from './approved-browser-support-policy';
import type { BrowserExperienceOutcome } from './browser-experience-outcome';
import type { BrowserSupportState } from './browser-support-state';

@Injectable({ providedIn: 'root' })
export class BrowserCapabilityAdapter implements OnDestroy {
  private static readonly outcomeEventName = 'repofluent:experience-outcome';
  private readonly document = inject(DOCUMENT);
  private initialized = false;

  readonly policy = approvedBrowserSupportPolicy;
  readonly state = signal<BrowserSupportState>('supported');

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    const forcedUnsupported =
      new URLSearchParams(this.document.location.search).get('browser') === 'unsupported';
    const state: BrowserSupportState =
      forcedUnsupported || !this.hasRequiredCapabilities() ? 'unsupported' : 'supported';
    this.state.set(state);

    const root = this.document.documentElement;
    root.dataset['rfBrowserPolicy'] = this.policy.id;
    root.dataset['rfBrowserSupport'] = state;
    if (state === 'unsupported') {
      root.dataset['rfMotion'] = 'reduced';
    }

    const view = this.document.defaultView;
    view?.addEventListener('error', this.recordCriticalError);
    view?.addEventListener('unhandledrejection', this.recordCriticalError);
    this.emit({
      kind: 'browser-capability',
      outcome: state,
      policyId: this.policy.id,
      presentation: state === 'supported' ? 'full' : 'safe-fallback',
    });
  }

  ngOnDestroy(): void {
    const view = this.document.defaultView;
    view?.removeEventListener('error', this.recordCriticalError);
    view?.removeEventListener('unhandledrejection', this.recordCriticalError);
  }

  private readonly recordCriticalError = (): void => {
    this.emit({
      kind: 'critical-error',
      outcome: 'recorded',
      policyId: this.policy.id,
      presentation: this.state() === 'supported' ? 'full' : 'safe-fallback',
    });
  };

  private hasRequiredCapabilities(): boolean {
    const view = this.document.defaultView;
    if (!view) return false;

    return Boolean(
      typeof view.HTMLDialogElement === 'function' &&
      typeof view.HTMLDialogElement.prototype.showModal === 'function' &&
      typeof view.CSS?.supports === 'function' &&
      view.CSS.supports('display', 'grid') &&
      typeof view.CustomEvent === 'function' &&
      typeof view.AbortController === 'function' &&
      typeof view.requestAnimationFrame === 'function' &&
      typeof view.URL === 'function' &&
      typeof view.URLSearchParams === 'function',
    );
  }

  private emit(outcome: BrowserExperienceOutcome): void {
    const view = this.document.defaultView;
    if (!view) return;

    view.dispatchEvent(
      new view.CustomEvent<BrowserExperienceOutcome>(BrowserCapabilityAdapter.outcomeEventName, {
        detail: outcome,
      }),
    );
  }
}
