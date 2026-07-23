import { expect, type Page } from '@playwright/test';

export class BrowserCapabilityPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.captureOutcomes();
    await this.page.goto('/quality');
    await expect(
      this.page.getByRole('heading', { name: 'Experience performance budgets' }),
    ).toBeVisible();
  }

  async expectPublishedPolicy(browserName: string, browserVersion: string): Promise<void> {
    await expect(this.page.locator('html')).toHaveAttribute(
      'data-rf-browser-policy',
      'angular-21-baseline-2025-10-20',
    );
    await expect(this.page.locator('html')).toHaveAttribute('data-rf-browser-support', 'supported');

    const policy = this.page.getByRole('region', { name: 'Supported browser policy' });
    await expect(policy).toContainText('Angular 21 widely available Baseline');
    await expect(policy).toContainText('20 October 2025');
    await expect(policy).toContainText('Chrome and Edge');
    await expect(policy).toContainText('Firefox');
    await expect(policy).toContainText('Safari and iOS');
    await expect(policy).toContainText('WebGPU');
    await expect(policy).toContainText('Optional · semantic fallback required');
    await expect(
      policy.getByRole('link', { name: 'Angular browser support source' }),
    ).toHaveAttribute('href', 'https://angular.dev/reference/versions#browser-support');

    const expectedEngine = {
      chromium: {
        label: 'Chromium 149.0.7827.x · Playwright 1.61.1',
        versionPrefix: '149.0.7827.',
      },
      firefox: { label: 'Firefox 151.0', versionPrefix: '151.0' },
      webkit: { label: 'WebKit 26.5', versionPrefix: '26.5' },
    }[browserName];
    expect(expectedEngine).toBeTruthy();
    await expect(policy).toContainText(expectedEngine!.label);
    expect(browserVersion.startsWith(expectedEngine!.versionPrefix)).toBeTruthy();
  }

  async expectSupportedCriticalFlow(): Promise<void> {
    await expect(
      this.page.getByRole('status', { name: 'Current browser capability status' }),
    ).toHaveText('Supported capabilities · full safe access');
    await this.page.getByRole('button', { name: 'Search curriculum, code, and systems' }).click();
    await expect(this.page.getByRole('dialog', { name: 'Command search' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Close command search' }).click();

    await this.page.goto('/systems?gpu=off');
    await expect(
      this.page.getByRole('heading', { name: 'Order processing system map' }),
    ).toBeVisible();
    await expect(this.page.getByRole('status', { name: 'Visualization capability' })).toContainText(
      'Semantic visualization active',
    );
    await expect(
      this.page.getByRole('table', { name: 'Order processing relationships' }),
    ).toBeVisible();
  }

  async expectSupportedOutcome(): Promise<void> {
    await expect
      .poll(async () => {
        const outcomes = await this.outcomes();
        return outcomes.find((outcome) => outcome['kind'] === 'browser-capability');
      })
      .toMatchObject({
        kind: 'browser-capability',
        outcome: 'supported',
        policyId: 'angular-21-baseline-2025-10-20',
        presentation: 'full',
      });
    await this.expectOutcomePayloadsAreCoarse();
  }

  async openUnsupported(): Promise<void> {
    await this.captureOutcomes();
    await this.page.goto('/quality?browser=unsupported');
    await expect(
      this.page.getByRole('heading', { name: 'Experience performance budgets' }),
    ).toBeVisible();
  }

  async expectUnsupportedGuidanceAndSafeAccess(): Promise<void> {
    await expect(this.page.locator('html')).toHaveAttribute(
      'data-rf-browser-support',
      'unsupported',
    );
    await expect(this.page.locator('html')).toHaveAttribute('data-rf-motion', 'reduced');

    const guidance = this.page.getByRole('alert', { name: 'Browser compatibility guidance' });
    await expect(guidance).toContainText('Browser compatibility mode');
    await expect(guidance).toContainText(
      'Use a current Chrome, Edge, Firefox, or Safari for the supported experience.',
    );
    await expect(guidance).toContainText(
      'Curriculum, learning, and semantic system information remain available.',
    );
    await expect(guidance).not.toContainText(/user agent|fingerprint|detected version/i);

    await this.page.getByRole('link', { name: 'Curricula' }).click();
    await expect(this.page.getByRole('heading', { name: 'Curriculum imports' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'My learning' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'System map' })).toBeVisible();
  }

  async expectUnsupportedOutcome(): Promise<void> {
    await expect
      .poll(async () => {
        const outcomes = await this.outcomes();
        return outcomes.find((outcome) => outcome['kind'] === 'browser-capability');
      })
      .toMatchObject({
        kind: 'browser-capability',
        outcome: 'unsupported',
        policyId: 'angular-21-baseline-2025-10-20',
        presentation: 'safe-fallback',
      });
    await this.expectOutcomePayloadsAreCoarse();
  }

  async expectScreenshot(name: string, maxDiffPixelRatio = 0.08): Promise<void> {
    await expect(this.page).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixelRatio,
    });
  }

  async showPolicyEvidence(): Promise<void> {
    await this.page.getByRole('region', { name: 'Supported browser policy' }).evaluate((policy) => {
      policy.scrollIntoView({ block: 'start' });
    });
  }

  async useNarrowViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 390, height: 844 });
  }

  private async captureOutcomes(): Promise<void> {
    await this.page.addInitScript(() => {
      window.addEventListener('repofluent:experience-outcome', (event) => {
        const key = 'repofluent-experience-outcomes';
        const outcomes = JSON.parse(sessionStorage.getItem(key) ?? '[]') as Array<
          Record<string, unknown>
        >;
        outcomes.push((event as CustomEvent).detail as Record<string, unknown>);
        sessionStorage.setItem(key, JSON.stringify(outcomes));
      });
    });
  }

  private async expectOutcomePayloadsAreCoarse(): Promise<void> {
    const outcomes = await this.outcomes();
    expect(outcomes.length).toBeGreaterThan(0);
    for (const outcome of outcomes) {
      expect(Object.keys(outcome).sort()).toEqual(['kind', 'outcome', 'policyId', 'presentation']);
      expect(JSON.stringify(outcome)).not.toMatch(
        /userAgent|platform|language|screen|hardware|tenant|user|email/i,
      );
    }
  }

  private async outcomes(): Promise<Array<Record<string, unknown>>> {
    return this.page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('repofluent-experience-outcomes') ?? '[]') as Array<
        Record<string, unknown>
      >;
    });
  }
}
