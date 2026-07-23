import { expect, type CDPSession, type Page } from '@playwright/test';

export class PerformanceBudgetPage {
  private labSession: CDPSession | null = null;

  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    this.labSession = await this.page.context().newCDPSession(this.page);
    await this.labSession.send('Network.enable');
    await this.labSession.send('Network.setCacheDisabled', { cacheDisabled: true });
    await this.labSession.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 40,
      downloadThroughput: 1_250_000,
      uploadThroughput: 625_000,
      connectionType: 'wifi',
    });
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        configurable: true,
        value: 4,
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        configurable: true,
        value: 8,
      });
    });
    await this.page.addInitScript(() => {
      window.addEventListener('repofluent:performance', (event) => {
        const key = 'repofluent-performance-events';
        const recorded = JSON.parse(sessionStorage.getItem(key) ?? '[]') as Array<
          Record<string, unknown>
        >;
        recorded.push((event as CustomEvent).detail as Record<string, unknown>);
        sessionStorage.setItem(key, JSON.stringify(recorded));
      });
    });
    await this.page.goto('/quality');
    await expect(
      this.page.getByRole('heading', { name: 'Experience performance budgets' }),
    ).toBeVisible();
  }

  async expectApprovedProfile(): Promise<void> {
    await expect(this.page.locator('html')).toHaveAttribute(
      'data-rf-performance-profile',
      'experience-production-v1',
    );
    const profile = this.page.getByRole('region', { name: 'Approved measurement profile' });
    await expect(profile).toContainText('Desktop · 4 logical cores · 8 GB memory');
    await expect(profile).toContainText('Chromium stable');
    await expect(profile).toContainText('Pilot broadband · 10 Mbps down · 5 Mbps up · 40 ms RTT');
    await expect(profile).toContainText('Cold shell / warm interaction');
    await expect(profile).toContainText('33 lesson blocks · 7 system nodes');
    await expect(profile).toContainText('Primary heading visible and navigation operable');
  }

  async expectShellBudget(): Promise<void> {
    await this.waitForMetric('learner-shell-usable');
    const shellMetric = await this.metrics().then((metrics) =>
      metrics.find((metric) => metric['name'] === 'learner-shell-usable'),
    );
    expect(
      shellMetric?.['durationMs'] as number,
      `Shell measurement: ${JSON.stringify(shellMetric)}`,
    ).toBeLessThanOrEqual(2500);
    expect(shellMetric).toMatchObject({
      budgetMs: 2500,
      kind: 'shell',
      name: 'learner-shell-usable',
      outcome: 'within-budget',
      profileId: 'experience-production-v1',
    });
    await this.labSession?.send('Network.setCacheDisabled', { cacheDisabled: false });
  }

  async exerciseRepresentativeInteractions(lessonUrl: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Search curriculum, code, and systems' }).click();
    await expect(this.page.getByRole('dialog', { name: 'Command search' })).toBeVisible();
    await this.waitForMetric('search');
    await this.page.getByRole('button', { name: 'Close command search' }).click();

    await this.page.getByRole('link', { name: 'System map' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Order processing system map' }),
    ).toBeVisible();
    await this.waitForMetric('navigation');

    await this.page.getByLabel('System layer').selectOption('platform');
    await expect(this.page.locator('[data-testid="system-map-visual-node"]')).toHaveCount(1);
    await this.waitForMetric('search-filter');

    await this.page.getByLabel('System layer').selectOption('all');
    await this.page
      .locator('[data-testid="system-map-visual-node"]')
      .filter({ hasText: 'Storefront' })
      .click();
    await expect(this.page.getByRole('heading', { name: 'Storefront details' })).toBeVisible();
    await this.waitForMetric('map-selection');

    await this.page.evaluate(() => {
      localStorage.setItem('repofluent-development-persona', 'learner');
    });
    await this.page.goto(lessonUrl);
    await expect(
      this.page.getByRole('heading', { name: 'How an order becomes a workflow' }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Show 10 more lesson blocks' }).click();
    await expect(this.page.getByRole('status', { name: 'Lesson content progress' })).toHaveText(
      'Showing 20 of 33 lesson blocks',
    );
    await this.waitForMetric('progress');

    await this.page.setViewportSize({ width: 390, height: 844 });
    await this.page
      .getByRole('button', { name: 'Open source context for OrderController.Create' })
      .click();
    await expect(this.page.getByRole('complementary', { name: 'Source context' })).toBeVisible();
    await this.waitForMetric('drawer');
  }

  async expectInteractionBudget(): Promise<void> {
    const expectedNames = [
      'navigation',
      'search',
      'search-filter',
      'drawer',
      'progress',
      'map-selection',
    ];
    const interactions = (await this.metrics()).filter(
      (metric) => metric['kind'] === 'interaction' && expectedNames.includes(`${metric['name']}`),
    );
    expect(new Set(interactions.map((metric) => metric['name']))).toEqual(new Set(expectedNames));

    const durations = interactions
      .map((metric) => metric['durationMs'] as number)
      .sort((left, right) => left - right);
    const p75Index = Math.ceil(durations.length * 0.75) - 1;
    expect(durations[p75Index]).toBeLessThanOrEqual(200);
    expect(interactions.every((metric) => metric['budgetMs'] === 200)).toBeTruthy();
  }

  async expectPrivacySafeRumContract(): Promise<void> {
    const metrics = await this.metrics();
    expect(metrics.length).toBeGreaterThan(0);
    for (const metric of metrics) {
      expect(Object.keys(metric).sort()).toEqual([
        'budgetMs',
        'durationMs',
        'kind',
        'name',
        'outcome',
        'profileId',
      ]);
      expect(JSON.stringify(metric)).not.toMatch(/tenant|user|email|path|content/i);
    }
  }

  async expectReducedMotionPolicy(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
    await this.page.goto('/quality');
    await expect(this.page.locator('html')).toHaveAttribute('data-rf-animation-policy', 'reduced');
    await expect(
      this.page.getByRole('status', { name: 'Animation performance policy' }),
    ).toHaveText('Reduced effects · semantic updates preserved');
  }

  async useNarrowViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 390, height: 844 });
  }

  async expectNoPageOverflow(): Promise<void> {
    const overflow = await this.page.locator('html').evaluate((root) => {
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  }

  async expectScreenshot(name: string, maxDiffPixelRatio = 0.08): Promise<void> {
    await expect(this.page).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixelRatio,
    });
  }

  private async waitForMetric(name: string): Promise<void> {
    await expect
      .poll(async () => {
        const metrics = await this.metrics();
        return metrics.some((metric) => metric['name'] === name);
      })
      .toBeTruthy();
  }

  private async metrics(): Promise<Array<Record<string, unknown>>> {
    return this.page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('repofluent-performance-events') ?? '[]') as Array<
        Record<string, unknown>
      >;
    });
  }
}
