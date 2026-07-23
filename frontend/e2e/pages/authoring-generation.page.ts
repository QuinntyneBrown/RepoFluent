import { expect, type Page } from '@playwright/test';

export class AuthoringGenerationPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/authoring-kit');
    await expect(this.page.getByRole('heading', { level: 1, name: 'Authoring kit' })).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: 'Deterministic generation' }),
    ).toBeVisible();
  }

  async expectStableGenerationPolicy(): Promise<void> {
    const policy = this.page.getByRole('region', { name: 'Authoring generation policy' });
    await expect(policy).toContainText('Stable namespace');
    await expect(policy).toContainText('Scope · kind · semantic key');
    await expect(policy).toContainText('Prose-independent IDs');
    await expect(policy).toContainText('Regeneration preserves identity');
    await expect(policy).toContainText('Collision stop');
    await expect(policy).toContainText('Report · never overwrite');
    await expect(policy).toContainText('Safe generation manifest');
    await expect(policy).toContainText('Tool · inputs · time · checksum');
    await expect(policy).toContainText('No hidden reasoning · no credentials · no full prompts');
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const policy = this.page.getByRole('region', { name: 'Authoring generation policy' });
    await policy.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .authoring-generation-policy {
          box-sizing: border-box !important;
          height: 560px !important;
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
    await expect(policy).toHaveScreenshot('generate-stable-curriculum.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
