import path from 'node:path';
import { expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

interface IntakeReceipt {
  id: string;
  checksum: string;
  isReplay: boolean;
}

export class CurriculumDraftImportPage {
  private readonly packagePath = path.resolve(
    process.cwd(),
    '..',
    'contracts/curriculum/0.1.0/fixtures/order-processing.json',
  );

  constructor(private readonly page: Page) {}

  async openAsAuthor(): Promise<void> {
    await this.page.addInitScript(() => {
      localStorage.setItem('repofluent-development-persona', 'author');
      localStorage.removeItem('repofluent-current-import');
    });
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Curriculum imports' })).toBeVisible();
  }

  async uploadPackage(): Promise<IntakeReceipt> {
    const curriculumPackage = JSON.parse(await readFile(this.packagePath, 'utf8')) as {
      packageId: string;
    };
    curriculumPackage.packageId = 'idempotent-import-foundations';
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'idempotent-import.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(curriculumPackage)),
    });
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/curriculum-imports') &&
        response.request().method() === 'POST',
    );
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const receipt = (await response.json()) as IntakeReceipt;
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible();
    return receipt;
  }

  async expectStableAndPlatformIdentities(): Promise<void> {
    const identity = this.page.getByRole('region', { name: 'Draft identity' });
    await expect(identity).toContainText('idempotent-import-foundations');
    await expect(identity).toContainText('1.0.0');
    await expect(identity.getByTestId('platform-draft-id')).toHaveText(
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/,
    );
  }

  async expectExistingDraftReused(): Promise<void> {
    await expect(this.page.getByRole('status', { name: 'Curriculum operation status' })).toHaveText(
      'Existing draft reused',
    );
    await expect(
      this.page.getByRole('region', { name: 'Draft identity' }).getByText('Existing receipt'),
    ).toBeVisible();
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 900 });
    const identity = this.page.getByRole('region', { name: 'Draft identity' });
    await identity.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .draft-identity {
          box-sizing: border-box !important;
          height: 280px !important;
          overflow: hidden !important;
        }
      `,
    });
    await expect(identity).toHaveScreenshot('import-draft-idempotently.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
