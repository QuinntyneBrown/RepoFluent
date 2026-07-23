import { expect, type Page } from '@playwright/test';

export class ProvenanceAndIdentitiesPage {
  constructor(private readonly page: Page) {}

  async uploadAndInspect(packageJson: string): Promise<void> {
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'provenance-and-identities.json',
      mimeType: 'application/json',
      buffer: Buffer.from(packageJson),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await this.page.getByRole('button', { name: 'Inspect contract model' }).click();
    await expect(this.page.getByRole('heading', { name: 'Provenance and identity' })).toBeVisible();
  }

  async expectEvidenceAndUncertainty(): Promise<void> {
    const provenance = this.page.getByRole('region', {
      name: 'Provenance, uncertainty, and identity rules',
    });
    await expect(provenance).toContainText('High confidence');
    await expect(provenance).toContainText('order-service · docs/orders.md');
    await expect(provenance).toContainText('Direct evidence');
    await expect(provenance).toContainText(
      'The supplied snapshot describes the persistence boundary.',
    );
    await expect(provenance).toContainText('Payment orchestration is outside this package.');
    await expect(provenance).toContainText(
      'The legacy runbook describes publication before persistence.',
    );
    await expect(provenance).toContainText('Which retry policy owns terminal failures?');
  }

  async expectCanonicalIdentityRules(): Promise<void> {
    const provenance = this.page.getByRole('region', {
      name: 'Provenance, uncertainty, and identity rules',
    });
    await expect(provenance).toContainText('Lowercase kebab case');
    await expect(provenance).toContainText('UTF-8 · application/json');
    await expect(provenance).toContainText('RFC 3339 · UTC Z');
    await expect(provenance).toContainText('No implicit defaults');
    await expect(provenance).toContainText('16 stable entities');
  }

  async uploadAndExpectIssues(
    packageJson: string,
    issues: ReadonlyArray<{ code: string; path: string }>,
  ): Promise<void> {
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'invalid-provenance-and-identities.json',
      mimeType: 'application/json',
      buffer: Buffer.from(packageJson),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Validation failed', { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    for (const issue of issues) {
      const row = this.page
        .getByRole('row')
        .filter({ hasText: issue.code })
        .filter({ hasText: issue.path });
      await expect(row).toHaveCount(1);
    }
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1200 });
    const provenance = this.page.getByRole('region', {
      name: 'Provenance, uncertainty, and identity rules',
    });
    await provenance.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .provenance-section {
          box-sizing: border-box !important;
          height: 778px !important;
          overflow: hidden !important;
        }
      `,
    });
    await provenance.evaluate((element) => {
      const panel = element as HTMLElement;
      const bounds = panel.getBoundingClientRect();
      panel.style.transform = `translate(
        ${Math.round(bounds.left) - bounds.left}px,
        ${Math.round(bounds.top) - bounds.top}px
      )`;
    });
    await expect(provenance).toHaveScreenshot('record-provenance-and-identities.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
