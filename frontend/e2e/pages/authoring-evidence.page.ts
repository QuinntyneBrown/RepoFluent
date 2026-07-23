import { expect, type Page } from '@playwright/test';

export class AuthoringEvidencePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/authoring-kit');
    await expect(this.page.getByRole('heading', { level: 1, name: 'Authoring kit' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Evidence ledger' })).toBeVisible();
  }

  async expectGovernedEvidence(): Promise<void> {
    const policy = this.page.getByRole('region', { name: 'Authoring evidence policy' });
    await expect(policy).toContainText('Source-bound citations');
    await expect(policy).toContainText('Repository · revision · path · locator');
    await expect(policy).toContainText('Claim classification');
    await expect(policy).toContainText('Direct evidence · synthesis · interpretation');
    await expect(policy).toContainText('Structured uncertainty');
    await expect(policy).toContainText('Assumptions · conflicts · omissions');
    await expect(policy).toContainText('Material uncertainty stays visible');
    await expect(policy).toContainText(
      'node scripts/validate-evidence.mjs evidence-report.json scope.json',
    );
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const policy = this.page.getByRole('region', { name: 'Authoring evidence policy' });
    await policy.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .authoring-evidence-policy {
          box-sizing: border-box !important;
          height: 500px !important;
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
    await expect(policy).toHaveScreenshot('cite-sources-and-uncertainty.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
