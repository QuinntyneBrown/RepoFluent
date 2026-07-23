import { expect, type Page } from '@playwright/test';

export class AuthoringEcosystemPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/authoring-kit');
    await expect(this.page.getByRole('heading', { level: 1, name: 'Authoring kit' })).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: 'Ecosystem analysis profiles' }),
    ).toBeVisible();
  }

  async expectEvidenceCheckedProfiles(): Promise<void> {
    const policy = this.page.getByRole('region', { name: 'Ecosystem analysis guidance' });
    await expect(policy).toContainText('.NET · 11 evidence categories');
    await expect(policy).toContainText('API · domain · persistence · messaging · workers');
    await expect(policy).toContainText('Dynamic registration');
    await expect(policy).toContainText('Report unresolved · never infer');
    await expect(policy).toContainText('Angular · 11 evidence categories');
    await expect(policy).toContainText('Bootstrap · routes · state · HTTP · guards');
    await expect(policy).toContainText('User → route → component → service → API');
    await expect(policy).toContainText(
      'node scripts/verify-ecosystem-analysis.mjs dotnet examples/analysis/dotnet-analysis.json',
    );
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const policy = this.page.getByRole('region', { name: 'Ecosystem analysis guidance' });
    await policy.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .authoring-ecosystem-policy {
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
    await expect(policy).toHaveScreenshot('analyze-dotnet-and-angular.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
