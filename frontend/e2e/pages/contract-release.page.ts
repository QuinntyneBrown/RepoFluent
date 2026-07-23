import { expect, type APIRequestContext, type Page } from '@playwright/test';

export class ContractReleasePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/contracts');
    await expect(
      this.page.getByRole('heading', { name: 'Published curriculum contract' }),
    ).toBeVisible();
  }

  async expectPublishedRelease(): Promise<void> {
    const release = this.page.getByRole('region', { name: 'Published contract release' });
    await expect(release.getByRole('heading', { name: 'Curriculum contract 0.1.0' })).toBeVisible();
    await expect(release).toContainText('Immutable');
    await expect(release).toContainText('Checksum verified');
    await expect(release.getByTestId('contract-release-checksum')).toHaveText(
      /^sha256:[a-f0-9]{64}$/,
    );

    const artifacts = [
      ['JSON Schema', 'curriculum.schema.json'],
      ['Interface control document', 'ICD.md'],
      ['Compatibility declaration', 'compatibility.json'],
      ['Validation code catalog', 'validation-codes.json'],
      ['Conformance fixtures', 'fixtures/conformance-catalog.json'],
      ['Release notes', 'release-notes.md'],
    ] as const;
    for (const [name, path] of artifacts) {
      await expect(release.getByRole('link', { name })).toHaveAttribute(
        'href',
        `/api/contracts/curriculum/releases/0.1.0/artifacts/${path}`,
      );
    }
  }

  async expectCompatibilityAndMigrationPolicy(): Promise<void> {
    const compatibility = this.page.getByRole('region', {
      name: 'Compatibility and migration policy',
    });
    await expect(compatibility).toContainText('>=0.1.0 <0.2.0');
    await expect(compatibility).toContainText('Major');
    await expect(compatibility).toContainText('Minor');
    await expect(compatibility).toContainText('Patch');
    await expect(compatibility).toContainText('Backward compatible');
    await expect(compatibility).toContainText('Forward compatible');
    await expect(compatibility).toContainText('180 days');
    await expect(compatibility).toContainText('Contract maintainers');
    await expect(compatibility).toContainText('CIC_UNSUPPORTED_VERSION');
    await expect(compatibility).toContainText('Stable identifiers');
    await expect(compatibility).toContainText('Protected semantics');
    await expect(compatibility).toContainText('Loss report');
  }

  async expectConformanceCoverage(): Promise<void> {
    const fixtures = this.page.getByRole('region', { name: 'Conformance fixture suite' });
    await expect(fixtures).toContainText('10 cases');
    await expect(fixtures.getByLabel('2 successful')).toBeVisible();
    await expect(fixtures.getByLabel('8 expected failures')).toBeVisible();
    for (const category of [
      'Required fields',
      'Types',
      'Identifiers',
      'References',
      'Ordering',
      'Security',
      'Assessment rules',
      'Limits',
    ]) {
      await expect(fixtures).toContainText(category);
    }
  }

  async expectPublicRetrieval(request: APIRequestContext): Promise<void> {
    const release = await request.get('/api/contracts/curriculum/releases/0.1.0');
    expect(release.ok()).toBeTruthy();
    const manifest = await release.json();
    expect(manifest.version).toBe('0.1.0');
    expect(manifest.releaseChecksum).toMatch(/^sha256:[a-f0-9]{64}$/);

    const schema = await request.get(
      '/api/contracts/curriculum/releases/0.1.0/artifacts/curriculum.schema.json',
    );
    expect(schema.ok()).toBeTruthy();
    expect((await schema.json()).title).toBe('RepoFluent Curriculum Package 0.1.0');

    const unsupported = await request.get('/api/contracts/curriculum/releases/1.0.0');
    expect(unsupported.status()).toBe(404);
    expect((await unsupported.json()).code).toBe('CIC_CONTRACT_VERSION_UNSUPPORTED');
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1800 });
    const release = this.page.getByRole('region', { name: 'Published contract release' });
    await release.scrollIntoViewIfNeeded();
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        [data-testid='contract-release-panel'] {
          box-sizing: border-box !important;
          height: 1536px !important;
          overflow: hidden !important;
        }
      `,
    });
    await expect(release).toHaveScreenshot('publish-versioned-contract-release.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }
}
