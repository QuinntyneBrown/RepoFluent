import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import type { ExperienceTheme } from './experience-theme';

@Injectable({ providedIn: 'root' })
export class ExperiencePlatformAdapter {
  static readonly designSystemVersion = '0.1.0';

  private readonly document = inject(DOCUMENT);

  initialize(): void {
    const requestedTheme = new URLSearchParams(this.document.location.search).get('theme');
    this.applyTheme(requestedTheme === 'tenant' ? 'tenant' : 'default');

    const view = this.document.defaultView;
    const reducedMotion =
      typeof view?.matchMedia === 'function'
        ? view.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    this.document.documentElement.dataset['rfMotion'] = reducedMotion ? 'reduced' : 'full';
    this.document.documentElement.dataset['rfDesignSystemVersion'] =
      ExperiencePlatformAdapter.designSystemVersion;
  }

  applyTheme(theme: ExperienceTheme): void {
    this.document.documentElement.dataset['rfTheme'] = theme;
  }
}
