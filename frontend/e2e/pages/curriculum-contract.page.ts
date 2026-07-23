import { expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

export class CurriculumContractPage {
  constructor(private readonly page: Page) {}

  async inspectModeledPackage(packagePath: string): Promise<void> {
    const curriculumPackage = JSON.parse(await readFile(packagePath, 'utf8')) as {
      packageId: string;
    };
    curriculumPackage.packageId = 'modeled-curriculum-foundations';
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name: 'modeled-curriculum-package.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(curriculumPackage)),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible();
    await this.page.getByRole('button', { name: 'Inspect contract model' }).click();
    await expect(this.page.getByRole('heading', { name: 'Contract model coverage' })).toBeVisible();
  }

  async expectMetadataAndSourceSnapshot(): Promise<void> {
    const metadata = this.page.getByRole('region', {
      name: 'Package metadata and source snapshot',
    });
    await expect(metadata).toContainText('modeled-curriculum-foundations');
    await expect(metadata).toContainText('0.1.0');
    await expect(metadata).toContainText('1.0.0');
    await expect(metadata).toContainText('Platform Enablement');
    await expect(metadata).toContainText('en-CA');
    await expect(metadata).toContainText('curriculum-agent');
    await expect(metadata).toContainText('Order Service');
    await expect(metadata).toContainText('services/order');
    await expect(metadata).toContainText('main');
    await expect(metadata).toContainText('8f24c1a');
    await expect(metadata).toContainText('docs/orders.md');
  }

  async expectArchitectureAndLearningModel(): Promise<void> {
    const architecture = this.page.getByRole('region', { name: 'Architecture model' });
    await expect(architecture).toContainText('Storefront');
    await expect(architecture).toContainText('Browser application');
    await expect(architecture).toContainText('Checkout');
    await expect(architecture).toContainText('calls');
    await expect(architecture).toContainText('Order Service');
    await expect(architecture).toContainText('Durable order');

    const learning = this.page.getByRole('region', { name: 'Learning model' });
    await expect(learning).toContainText('Product engineers');
    await expect(learning).toContainText('angular');
    await expect(learning).toContainText('Required');
    await expect(learning).toContainText('HTTP request fundamentals');
    await expect(learning).toContainText('Score at least 80% on the checkpoint');
  }

  async expectAssessmentModelKeepsAnswersProtected(): Promise<void> {
    const assessment = this.page.getByRole('region', { name: 'Assessment model' });
    await expect(assessment).toContainText('Order workflow checkpoint');
    await expect(assessment).toContainText('Formative');
    await expect(assessment).toContainText('Single choice');
    await expect(assessment).toContainText('80%');
    await expect(assessment).toContainText('2 attempts');
    await expect(assessment).toContainText('10 min');
    await expect(assessment).toContainText('After submission');
    await expect(assessment).toContainText('trace-order');
    await expect(assessment).toContainText('order-system');
    await expect(assessment).toContainText('checkout-subsystem');
    await expect(assessment).toContainText('Protected grading material');
    await expect(assessment).not.toContainText('Persist the order, then publish the message');
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 2200 });
    const workbench = this.page.getByTestId('contract-model-workbench');
    await workbench.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        [data-testid='contract-model-workbench'] {
          box-sizing: border-box !important;
          height: 1664px !important;
          overflow: hidden !important;
        }
      `,
    });
    await expect(workbench).toHaveScreenshot('model-curriculum-package-workbench.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
