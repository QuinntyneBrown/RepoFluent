import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ExperiencePlatformAdapter } from './experience-platform-adapter';

describe('ExperiencePlatformAdapter', () => {
  it('applies the versioned default theme contract', () => {
    const document = TestBed.inject(DOCUMENT);
    const adapter = TestBed.inject(ExperiencePlatformAdapter);

    adapter.initialize();

    expect(document.documentElement.dataset['rfTheme']).toBe('default');
    expect(document.documentElement.dataset['rfDesignSystemVersion']).toBe('0.1.0');
  });

  it('applies an approved tenant theme without changing component markup', () => {
    const document = TestBed.inject(DOCUMENT);
    const adapter = TestBed.inject(ExperiencePlatformAdapter);

    adapter.applyTheme('tenant');

    expect(document.documentElement.dataset['rfTheme']).toBe('tenant');
  });

  it('focuses and announces the primary heading after navigation', () => {
    const document = TestBed.inject(DOCUMENT);
    const adapter = TestBed.inject(ExperiencePlatformAdapter);
    const main = document.createElement('main');
    const heading = document.createElement('h1');
    main.id = 'main-content';
    heading.textContent = 'My learning';
    main.append(heading);
    document.body.append(main);

    adapter.focusPrimaryHeading();

    expect(document.activeElement).toBe(heading);
    expect(heading.tabIndex).toBe(-1);
    expect(adapter.pageAnnouncement()).toBe('My learning page loaded');
    main.remove();
  });
});
