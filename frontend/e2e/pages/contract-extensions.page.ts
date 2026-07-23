import { expect, type Page } from '@playwright/test';

export class ContractExtensionsPage {
  constructor(private readonly page: Page) {}

  async uploadNoncriticalAndInspect(packageJson: string): Promise<void> {
    await this.upload(packageJson, 'noncritical-extension.json');
    await expect(this.page.getByText('Ready for review', { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    const notices = this.page.getByRole('region', {
      name: 'Extension validation notices',
    });
    await expect(notices).toContainText('Noncritical extension ignored');
    const warning = notices.getByRole('row').filter({ hasText: 'CIC_EXTENSION_IGNORED' });
    await expect(warning).toContainText('Warning');
    await expect(warning).toContainText('/extensions/0/namespace');

    await this.page.getByRole('button', { name: 'Inspect contract model' }).click();
    await expect(this.page.getByRole('heading', { name: 'Contract extensions' })).toBeVisible();
  }

  async expectCoreAndExtensionPolicy(): Promise<void> {
    const workbench = this.page.getByTestId('contract-model-workbench');
    await expect(workbench.getByRole('heading', { name: 'Contract model coverage' })).toBeVisible();
    await expect(
      workbench.getByText('Order Processing Foundations', { exact: true }),
    ).toBeVisible();

    const extensions = this.page.getByRole('region', { name: 'Contract extension policy' });
    await expect(extensions).toContainText('com.acme.learning.insights');
    await expect(extensions).toContainText('Version 1.2.0');
    await expect(extensions).toContainText('Noncritical');
    await expect(extensions).toContainText('Ignored safely');
    await expect(extensions).toContainText('Core interpretation unchanged');
  }

  async uploadAndExpectBlockingIssue(
    packageJson: string,
    code: string,
    path: string,
  ): Promise<void> {
    await this.upload(packageJson, 'critical-extension.json');
    await expect(this.page.getByText('Validation failed', { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    const issue = this.page.getByRole('row').filter({ hasText: code }).filter({ hasText: path });
    await expect(issue).toHaveCount(1);
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const extensions = this.page.getByRole('region', { name: 'Contract extension policy' });
    await extensions.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .extension-section {
          box-sizing: border-box !important;
          height: 520px !important;
          overflow: hidden !important;
        }
      `,
    });
    await extensions.evaluate((element) => {
      const panel = element as HTMLElement;
      const bounds = panel.getBoundingClientRect();
      panel.style.transform = `translate(
        ${Math.round(bounds.left) - bounds.left}px,
        ${Math.round(bounds.top) - bounds.top}px
      )`;
    });
    await expect(extensions).toHaveScreenshot('support-contract-extensions.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }

  private async upload(packageJson: string, name: string): Promise<void> {
    await this.page.getByLabel('Curriculum package').setInputFiles({
      name,
      mimeType: 'application/json',
      buffer: Buffer.from(packageJson),
    });
    await this.page.getByRole('button', { name: 'Upload and validate' }).click();
  }
}
