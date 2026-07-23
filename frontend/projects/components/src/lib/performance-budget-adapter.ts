import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { approvedPerformanceProfile } from './approved-performance-profile';
import type { PerformanceMeasurement } from './performance-measurement';

@Injectable({ providedIn: 'root' })
export class PerformanceBudgetAdapter implements OnDestroy {
  private static readonly measurementEventName = 'repofluent:performance';
  private static readonly retainedMeasurementCount = 20;
  private readonly document = inject(DOCUMENT);
  private initialized = false;
  private shellMeasured = false;
  private longTaskObserver: PerformanceObserver | null = null;

  readonly profile = approvedPerformanceProfile;
  readonly measurements = signal<readonly PerformanceMeasurement[]>([]);
  readonly animationPolicy = signal<'full' | 'reduced' | 'degraded'>('full');

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    const root = this.document.documentElement;
    root.dataset['rfPerformanceProfile'] = this.profile.id;
    const view = this.document.defaultView;
    const reducedMotion =
      typeof view?.matchMedia === 'function'
        ? view.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    this.applyAnimationPolicy(reducedMotion ? 'reduced' : 'full');

    this.document.addEventListener('click', this.captureInteraction, true);
    this.document.addEventListener('change', this.captureInteraction, true);
    this.observeLongTasks();
  }

  markShellUsable(): void {
    if (this.shellMeasured) return;
    const heading = this.document.querySelector('#main-content h1');
    const navigation = this.document.querySelector('nav[aria-label="Primary navigation"]');
    if (!heading || !navigation) return;

    this.shellMeasured = true;
    this.record(
      'learner-shell-usable',
      'shell',
      this.document.defaultView?.performance.now() ?? 0,
      this.profile.shellBudgetMs,
    );
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('click', this.captureInteraction, true);
    this.document.removeEventListener('change', this.captureInteraction, true);
    this.longTaskObserver?.disconnect();
  }

  private readonly captureInteraction = (event: Event): void => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement>('[data-rf-performance-interaction]');
    if (!target) return;

    const expectedEvent = target.dataset['rfPerformanceEvent'] ?? 'click';
    if (event.type !== expectedEvent) return;
    const name = target.dataset['rfPerformanceInteraction'];
    const view = this.document.defaultView;
    if (!name || !view) return;

    const startedAt = view.performance.now();
    view.requestAnimationFrame(() => {
      view.requestAnimationFrame(() => {
        this.record(
          name,
          'interaction',
          view.performance.now() - startedAt,
          this.profile.interactionBudgetMs,
        );
      });
    });
  };

  private observeLongTasks(): void {
    const view = this.document.defaultView;
    if (
      !view ||
      typeof view.PerformanceObserver !== 'function' ||
      !view.PerformanceObserver.supportedEntryTypes.includes('longtask')
    ) {
      return;
    }

    this.longTaskObserver = new view.PerformanceObserver((list) => {
      if (list.getEntries().some((entry) => entry.duration >= 50)) {
        this.applyAnimationPolicy('degraded');
      }
    });
    this.longTaskObserver.observe({ entryTypes: ['longtask'] });
  }

  private applyAnimationPolicy(policy: 'full' | 'reduced' | 'degraded'): void {
    if (policy === 'degraded' && this.animationPolicy() === 'reduced') return;
    this.animationPolicy.set(policy);
    this.document.documentElement.dataset['rfAnimationPolicy'] = policy;
    if (policy !== 'full') {
      this.document.documentElement.dataset['rfMotion'] = 'reduced';
    }
  }

  private record(
    name: string,
    kind: PerformanceMeasurement['kind'],
    durationMs: number,
    budgetMs: number,
  ): void {
    const measurement: PerformanceMeasurement = {
      name,
      kind,
      durationMs: Math.round(durationMs * 10) / 10,
      budgetMs,
      outcome: durationMs <= budgetMs ? 'within-budget' : 'budget-breach',
      profileId: this.profile.id,
    };
    this.measurements.update((current) =>
      [...current, measurement].slice(-PerformanceBudgetAdapter.retainedMeasurementCount),
    );

    const view = this.document.defaultView;
    if (view) {
      view.dispatchEvent(
        new view.CustomEvent<PerformanceMeasurement>(
          PerformanceBudgetAdapter.measurementEventName,
          {
            detail: measurement,
          },
        ),
      );
    }
  }
}
