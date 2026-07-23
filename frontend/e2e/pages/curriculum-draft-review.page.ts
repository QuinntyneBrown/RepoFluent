import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export class CurriculumDraftReviewPage {
  constructor(private readonly page: Page) {}

  async openAndUploadAsAuthor(): Promise<void> {
    const packagePath = path.resolve(
      process.cwd(),
      '..',
      'contracts/curriculum/0.1.0/fixtures/order-processing.json',
    );
    const curriculumPackage = JSON.parse(await readFile(packagePath, 'utf8')) as {
      packageId: string;
    };
    curriculumPackage.packageId = 'draft-preview-review-foundations';
    await this.page.addInitScript(() => {
      localStorage.setItem('repofluent-development-persona', 'author');
      localStorage.removeItem('repofluent-current-import');
    });
    await this.page.goto('/');
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'draft-preview-review.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(curriculumPackage)),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible();
  }

  async actAsReviewer(): Promise<void> {
    await this.page.getByLabel('Development persona').selectOption('reviewer');
    await expect(this.page.getByRole('button', { name: 'Preview draft' })).toBeVisible();
  }

  async openLearnerEquivalentPreview(): Promise<void> {
    await this.page.getByRole('button', { name: 'Preview draft' }).click();
    const evidence = this.page.getByRole('region', { name: 'Draft preview evidence' });
    await expect(evidence).toContainText('Learner-equivalent preview');
    await expect(evidence).toContainText('Draft 1.0.0');
    await expect(evidence).toContainText('Production renderer');
    await expect(evidence).toContainText('Progress writes disabled');
    await expect(evidence).toContainText('Assessment writes disabled');
    await expect(evidence).toContainText('Protected answers withheld');
    await expect(
      this.page.getByRole('heading', { name: 'How an order becomes a workflow' }),
    ).toBeVisible();
    await expect(this.page.getByText('Draft preview', { exact: true })).toBeVisible();
  }

  async approveExactReport(): Promise<void> {
    await this.page.getByRole('button', { name: 'Acknowledge exact warnings' }).click();
    await this.page
      .getByLabel('Review rationale')
      .fill('Renderer, source evidence, validation report, and warning set reviewed.');
    await this.page.getByRole('button', { name: 'Approve this checksum' }).click();
    const decision = this.page.getByRole('region', { name: 'Review decision evidence' });
    await expect(decision).toBeVisible();
    await expect(decision).toContainText('Approved');
    await expect(decision).toContainText('reviewer');
    await expect(decision).toContainText('draft-preview-review-foundations');
    await expect(decision).toContainText('1.0.0');
    await expect(decision).toContainText('Warning acknowledgement bound');
    await expect(decision).toContainText(/sha256:[a-f0-9]{64}/);
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1200 });
    const decision = this.page.getByRole('region', { name: 'Review decision evidence' });
    await decision.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .review-decision {
          box-sizing: border-box !important;
          min-height: 480px !important;
        }
      `,
    });
    await expect(decision).toHaveScreenshot('preview-and-review-draft.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
