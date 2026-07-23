import { expect, type Page } from '@playwright/test';

export class ProgressiveVisualizationPage {
  constructor(private readonly page: Page) {}

  async openWithGpuPolicy(policy: 'off' | 'fail'): Promise<void> {
    await this.page.addInitScript(() => {
      window.addEventListener('repofluent:capability', (event) => {
        const detail = (event as CustomEvent).detail as Record<string, string>;
        sessionStorage.setItem('repofluent-capability-event', JSON.stringify(detail));
      });
    });
    await this.page.goto(`/systems?gpu=${policy}`);
    await expect(
      this.page.getByRole('heading', { name: 'Order processing system map' }),
    ).toBeVisible();
  }

  async expectSafeFallback(reason: 'policy-disabled' | 'initialization-failed'): Promise<void> {
    await expect(this.page.locator('html')).toHaveAttribute(
      'data-rf-visualization-capability',
      'fallback',
    );
    await expect(this.page.getByRole('status', { name: 'Visualization capability' })).toContainText(
      'Semantic visualization active',
    );

    const event = await this.page.evaluate(() => {
      const value = sessionStorage.getItem('repofluent-capability-event');
      return value ? (JSON.parse(value) as Record<string, string>) : null;
    });
    expect(event).toEqual({
      capability: 'webgpu',
      mode: 'fallback',
      reason,
    });
  }

  async expectEquivalentCompanion(): Promise<void> {
    await expect(
      this.page.getByRole('img', {
        name: 'Order processing systems and directional relationships',
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole('table', { name: 'Order processing relationships' }),
    ).toBeVisible();
    await expect(this.page.locator('[data-testid="system-map-visual-node"]')).toHaveCount(7);
    await expect(
      this.page.getByRole('table', { name: 'Order processing relationships' }).locator('tbody tr'),
    ).toHaveCount(7);
    await expect(this.page.locator('#system-map-description')).toContainText(
      'Storefront sends an HTTPS order command to Order API',
    );
  }

  async selectMessageBusFromCompanion(): Promise<void> {
    await this.page
      .getByRole('table', { name: 'Order processing relationships' })
      .getByRole('button', { name: 'Select Message bus' })
      .first()
      .click();

    await expect(this.page.getByRole('heading', { name: 'Message bus details' })).toBeVisible();
    await expect(
      this.page
        .locator('[data-testid="system-map-visual-node"]')
        .filter({ hasText: 'Message bus' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await this.scrollMapIntoView();
  }

  async filterToPlatformLayer(): Promise<void> {
    await this.page.getByLabel('System layer').selectOption('platform');
    await expect(this.page.locator('[data-testid="system-map-visual-node"]')).toHaveCount(1);
    await expect(
      this.page.getByRole('table', { name: 'Order processing relationships' }).locator('tbody tr'),
    ).toHaveCount(2);
    await expect(this.page.getByRole('heading', { name: 'Message bus details' })).toBeVisible();
    await this.scrollMapIntoView();
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

  private async scrollMapIntoView(): Promise<void> {
    await this.page.locator('.map-layout').evaluate((map) => {
      map.scrollIntoView({ block: 'start' });
    });
  }
}
