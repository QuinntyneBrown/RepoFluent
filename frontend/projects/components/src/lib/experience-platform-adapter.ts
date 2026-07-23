import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import type { ExperienceTheme } from './experience-theme';

@Injectable({ providedIn: 'root' })
export class ExperiencePlatformAdapter {
  static readonly designSystemVersion = '0.1.0';

  private readonly document = inject(DOCUMENT);
  readonly pageAnnouncement = signal('');

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

  focusPrimaryHeading(): void {
    const heading = this.document.querySelector<HTMLHeadingElement>('#main-content h1');
    if (!heading) return;

    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    this.pageAnnouncement.set(`${heading.textContent?.trim() ?? 'Page'} page loaded`);
  }

  openContext(parameter: string, value: string): void {
    const view = this.document.defaultView;
    if (!view) return;

    const url = new URL(view.location.href);
    url.searchParams.set(parameter, value);
    view.history.pushState({ ...view.history.state, repoFluentContext: parameter }, '', url);
  }

  closeContext(parameter: string): boolean {
    const view = this.document.defaultView;
    if (!view) return false;

    if (view.history.state?.repoFluentContext === parameter) {
      view.history.back();
      return true;
    }

    const url = new URL(view.location.href);
    url.searchParams.delete(parameter);
    view.history.replaceState(view.history.state, '', url);
    return false;
  }

  readContext(parameter: string): string | null {
    const view = this.document.defaultView;
    return view ? new URL(view.location.href).searchParams.get(parameter) : null;
  }

  listenForContextChange(listener: () => void): () => void {
    const view = this.document.defaultView;
    if (!view) return () => undefined;

    view.addEventListener('popstate', listener);
    return () => view.removeEventListener('popstate', listener);
  }
}
