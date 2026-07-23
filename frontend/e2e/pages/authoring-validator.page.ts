import { expect, type Page } from '@playwright/test';

export class AuthoringValidatorPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/authoring-kit');
    await expect(this.page.getByRole('heading', { level: 1, name: 'Authoring kit' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Local validation matrix' })).toBeVisible();
  }

  async expectNoninteractiveContract(): Promise<void> {
    const policy = this.page.getByRole('region', { name: 'Local validator interface' });
    await expect(policy).toContainText('Package + contract');
    await expect(policy).toContainText('0.1.0 · auto-detect');
    await expect(policy).toContainText('Output format');
    await expect(policy).toContainText('JSON · text');
    await expect(policy).toContainText('Severity threshold');
    await expect(policy).toContainText('info · warning · error');
    await expect(policy).toContainText(
      '0 success · 3 warnings · 1 failure · 2 invocation · 4 internal',
    );
    await expect(policy).toContainText(
      'node scripts/validate.mjs package.json --contract auto --format json --threshold warning',
    );
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const policy = this.page.getByRole('region', { name: 'Local validator interface' });
    await policy.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .authoring-validator-policy {
          box-sizing: border-box !important;
          height: 520px !important;
          overflow: hidden !important;
        }
      `,
    });
    await policy.evaluate((element) => {
      const panel = element as HTMLElement;
      const bounds = panel.getBoundingClientRect();
      panel.style.transform = `translate(
        ${Math.round(bounds.left) - bounds.left}px,
        ${Math.round(bounds.top) - bounds.top}px
      )`;
    });
    await expect(policy).toHaveScreenshot('validate-packages-locally.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
