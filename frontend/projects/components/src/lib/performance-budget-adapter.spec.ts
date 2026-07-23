import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PerformanceBudgetAdapter } from './performance-budget-adapter';

describe('PerformanceBudgetAdapter', () => {
  it('publishes the approved measurement profile and shell milestone', () => {
    const document = TestBed.inject(DOCUMENT);
    const adapter = TestBed.inject(PerformanceBudgetAdapter);
    const main = document.createElement('main');
    const heading = document.createElement('h1');
    const navigation = document.createElement('nav');
    main.id = 'main-content';
    heading.textContent = 'Experience performance budgets';
    navigation.setAttribute('aria-label', 'Primary navigation');
    main.append(heading);
    document.body.append(main, navigation);
    const performanceNow = vi.spyOn(window.performance, 'now').mockReturnValue(1200);

    adapter.initialize();
    adapter.markShellUsable();

    expect(document.documentElement.dataset['rfPerformanceProfile']).toBe(
      'experience-production-v1',
    );
    expect(adapter.measurements()[0]).toMatchObject({
      name: 'learner-shell-usable',
      kind: 'shell',
      budgetMs: 2500,
      outcome: 'within-budget',
      profileId: 'experience-production-v1',
    });
    performanceNow.mockRestore();
    main.remove();
    navigation.remove();
  });

  it('measures a named interaction and emits only the bounded RUM payload', () => {
    const document = TestBed.inject(DOCUMENT);
    const adapter = TestBed.inject(PerformanceBudgetAdapter);
    const button = document.createElement('button');
    button.dataset['rfPerformanceInteraction'] = 'map-selection';
    document.body.append(button);
    const requestAnimationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(performance.now());
        return 1;
      });
    let payload: Record<string, unknown> | null = null;
    const capture = (event: Event): void => {
      payload = (event as CustomEvent).detail as Record<string, unknown>;
    };
    window.addEventListener('repofluent:performance', capture);

    adapter.initialize();
    button.click();

    expect(payload).toMatchObject({
      name: 'map-selection',
      kind: 'interaction',
      budgetMs: 200,
      outcome: 'within-budget',
      profileId: 'experience-production-v1',
    });
    expect(Object.keys(payload!).sort()).toEqual([
      'budgetMs',
      'durationMs',
      'kind',
      'name',
      'outcome',
      'profileId',
    ]);

    window.removeEventListener('repofluent:performance', capture);
    requestAnimationFrame.mockRestore();
    button.remove();
  });
});
