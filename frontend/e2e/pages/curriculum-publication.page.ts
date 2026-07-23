import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export class CurriculumPublicationPage {
  constructor(private readonly page: Page) {}

  async openApprovedDraft(): Promise<void> {
    const packagePath = path.resolve(
      process.cwd(),
      '..',
      'contracts/curriculum/0.1.0/fixtures/order-processing.json',
    );
    const curriculumPackage = JSON.parse(await readFile(packagePath, 'utf8')) as {
      packageId: string;
    };
    curriculumPackage.packageId = 'immutable-publication-foundations';

    await this.page.addInitScript(() => {
      localStorage.setItem('repofluent-development-persona', 'author');
      localStorage.removeItem('repofluent-current-import');
    });
    await this.page.goto('/');
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'immutable-publication.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(curriculumPackage)),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible();

    await this.page.getByLabel('Development persona').selectOption('reviewer');
    await this.page.getByRole('button', { name: 'Acknowledge exact warnings' }).click();
    await this.page
      .getByLabel('Review rationale')
      .fill('Approved rendering, validation evidence, and warning set for publication.');
    await this.page.getByRole('button', { name: 'Approve this checksum' }).click();
    await expect(this.page.getByRole('region', { name: 'Review decision evidence' })).toContainText(
      'Approved',
    );
  }

  async publishAsAdministrator(): Promise<void> {
    await this.page.getByLabel('Development persona').selectOption('administrator');
    await this.page.getByRole('button', { name: 'Publish version' }).click();

    const evidence = this.page.getByRole('region', { name: 'Publication evidence' });
    await expect(evidence).toContainText('Immutable publication');
    await expect(evidence).toContainText('Active for assignment');
    await expect(evidence).toContainText('immutable-publication-foundations');
    await expect(evidence).toContainText('1.0.0');
    await expect(evidence).toContainText('administrator');
    await expect(evidence).toContainText('Publication event');
    await expect(evidence).toContainText('Read-only content');
    await expect(evidence).toContainText('Read-only source snapshot');
    await expect(evidence).toContainText('Read-only assessments');
    await expect(evidence).toContainText('Protected answer policy retained');
    await expect(evidence).toContainText(/sha256:[a-f0-9]{64}/);
    await expect(evidence).toContainText(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
    );
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1200 });
    const evidence = this.page.getByRole('region', { name: 'Publication evidence' });
    await evidence.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
      `,
    });
    await expect(evidence).toHaveScreenshot('publish-immutable-version.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
