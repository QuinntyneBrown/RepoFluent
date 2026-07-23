import { expect, type Page } from '@playwright/test';

export class AuthoringScopePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/authoring-kit');
    await expect(this.page.getByRole('heading', { level: 1, name: 'Authoring kit' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Scope preflight' })).toBeVisible();
  }

  async expectGovernedBoundary(): Promise<void> {
    const policy = this.page.getByRole('region', { name: 'Authoring scope policy' });
    await expect(policy).toContainText('Repository instructions');
    await expect(policy).toContainText('Root → directory precedence');
    await expect(policy).toContainText('Declared source scope');
    await expect(policy).toContainText('Repositories · documents · revisions');
    await expect(policy).toContainText('Sensitive-data stop');
    await expect(policy).toContainText('Secret scan before generation');
    await expect(policy).toContainText('No elevation · no undeclared access');
    await expect(policy).toContainText('node scripts/preflight.mjs scope.json');
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const policy = this.page.getByRole('region', { name: 'Authoring scope policy' });
    await policy.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .authoring-scope-policy {
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
    await expect(policy).toHaveScreenshot('constrain-agent-scope.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
