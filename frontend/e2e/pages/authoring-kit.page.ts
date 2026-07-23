import { expect, type Page } from '@playwright/test';

export interface AuthoringKitManifest {
  kit: string;
  kitVersion: string;
  contractVersion: string;
  validatorVersion: string;
  releaseChecksum: string;
  offline: {
    supported: boolean;
    validationRequiresNetwork: boolean;
    optionalNetworkFeaturesEnabledByDefault: boolean;
  };
  artifacts: Array<{
    name: string;
    path: string;
    sha256: string;
    downloadUrl: string;
  }>;
}

export class AuthoringKitPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/authoring-kit');
    await expect(this.page).toHaveURL(/\/authoring-kit$/);
    await expect(this.page.getByRole('heading', { level: 1, name: 'Authoring kit' })).toBeVisible();
  }

  async expectPortableOfflineRelease(): Promise<void> {
    const release = this.page.getByRole('region', { name: 'Authoring kit release' });
    await expect(release).toContainText(/Kit\s*0\.1\.0/);
    await expect(release).toContainText(/Contract\s*0\.1\.0/);
    await expect(release).toContainText(/Validator\s*0\.1\.0/);
    await expect(release).toContainText('Offline ready');
    await expect(release).toContainText('Network optional · disabled');

    for (const artifact of [
      'AGENTS.md',
      'generate-curriculum.md',
      'SKILL.md',
      'curriculum.schema.json',
      'ICD.md',
      'order-processing.json',
      'missing-title.json',
      'validate.mjs',
      'release-notes.md',
      'checksums.sha256',
    ]) {
      await expect(release.getByRole('row').filter({ hasText: artifact })).toHaveCount(1);
    }
  }

  async getManifest(): Promise<AuthoringKitManifest> {
    const response = await this.page.request.get('/api/authoring-kits/releases/0.1.0');
    expect(response.ok()).toBe(true);
    return response.json();
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1000 });
    const release = this.page.getByRole('region', { name: 'Authoring kit release' });
    await release.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        .authoring-kit-release {
          box-sizing: border-box !important;
          height: 620px !important;
          overflow: hidden !important;
        }
      `,
    });
    await release.evaluate((element) => {
      const panel = element as HTMLElement;
      const bounds = panel.getBoundingClientRect();
      panel.style.transform = `translate(
        ${Math.round(bounds.left) - bounds.left}px,
        ${Math.round(bounds.top) - bounds.top}px
      )`;
    });
    await expect(release).toHaveScreenshot('publish-authoring-kit.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
