import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export class CurriculumValidationPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Curriculum imports' })).toBeVisible();
  }

  async uploadRepresentativePackage(): Promise<void> {
    const packagePath = path.resolve(
      process.cwd(),
      '..',
      'contracts/curriculum/0.1.0/fixtures/order-processing.json',
    );
    await this.page.getByLabel('Curriculum package').setInputFiles(packagePath);
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible();
  }

  async expectVersionedValidationEvidence(): Promise<void> {
    const evidence = this.page.getByRole('region', { name: 'Validation evidence' });
    await expect(evidence.getByRole('article', { name: 'Contract 0.1.0' })).toBeVisible();
    await expect(evidence.getByRole('article', { name: 'Validator 0.1.0' })).toBeVisible();
    await expect(evidence).toContainText('11 check categories');
    await expect(evidence).toContainText('0 errors · 1 warning');
    await expect(evidence).toContainText(/sha256:[a-f0-9]{64}/);
    await expect(evidence).toContainText('Acknowledgement required');
  }

  async acknowledgeExactWarnings(): Promise<void> {
    await this.page.getByRole('button', { name: 'Acknowledge exact warnings' }).click();
    await expect(
      this.page.getByRole('status', { name: 'Warning acknowledgement status' }),
    ).toHaveText('Warnings acknowledged');
    await expect(this.page.getByRole('button', { name: 'Approve this checksum' })).toBeVisible();
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const evidence = this.page.getByRole('region', { name: 'Validation evidence' });
    await evidence.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .validation-evidence {
          box-sizing: border-box !important;
          height: 400px !important;
          overflow: hidden !important;
        }
      `,
    });
    await evidence.evaluate((element) => {
      const panel = element as HTMLElement;
      const bounds = panel.getBoundingClientRect();
      panel.style.transform = `translate(
        ${Math.round(bounds.left) - bounds.left}px,
        ${Math.round(bounds.top) - bounds.top}px
      )`;
    });
    await expect(evidence).toHaveScreenshot('receive-and-validate-package.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
