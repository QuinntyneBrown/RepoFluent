import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

export class CurriculumLifecycleOperationsPage {
  private readonly apiBaseUrl = `${
    process.env['REPOFLUENT_API_BASE_URL'] ?? 'http://127.0.0.1:5080'
  }/api`;
  private targetImportId = '';

  constructor(private readonly page: Page) {}

  async createAuditedRetirement(request: APIRequestContext): Promise<void> {
    const fixturePath = path.resolve(
      process.cwd(),
      '..',
      'contracts/curriculum/0.1.0/fixtures/order-processing.json',
    );
    const versionOne = JSON.parse(await readFile(fixturePath, 'utf8')) as {
      packageId: string;
      version: string;
      title: string;
    };
    versionOne.packageId = 'lifecycle-audit-foundations';
    versionOne.version = '1.0.0';
    versionOne.title = 'Lifecycle Audit Foundations';
    const publishedOne = await this.publishPackage(request, versionOne);

    const versionTwo = structuredClone(versionOne);
    versionTwo.version = '2.0.0';
    versionTwo.title = 'Lifecycle Audit Foundations corrected';
    const publishedTwo = await this.publishPackage(request, versionTwo);
    this.targetImportId = publishedTwo.importId;

    const comparison = await request.get(
      `${this.apiBaseUrl}/curriculum-drafts/${publishedTwo.importId}/comparisons/${publishedOne.versionId}`,
      { headers: this.personaHeaders('reviewer') },
    );
    expect(comparison.ok()).toBeTruthy();
    const retirement = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${publishedTwo.importId}/retire`,
      {
        headers: this.personaHeaders('administrator'),
        data: { reason: 'Superseded after lifecycle operations review.' },
      },
    );
    expect(retirement.ok()).toBeTruthy();
  }

  async openHistoryAsAuditor(): Promise<void> {
    await this.page.addInitScript(
      ({ importId }) => {
        localStorage.setItem('repofluent-development-persona', 'auditor');
        localStorage.setItem('repofluent-current-import', importId);
      },
      { importId: this.targetImportId },
    );
    await this.page.goto('/');

    const operations = this.page.getByRole('region', {
      name: 'Lifecycle operational evidence',
    });
    await expect(operations).toContainText('Retired history');
    await expect(operations).toContainText('Intake');
    await expect(operations).toContainText('Validation');
    await expect(operations).toContainText('Review');
    await expect(operations).toContainText('Publication');
    await expect(operations).toContainText('Retirement');
    await expect(operations).toContainText('Support correlation');

    await this.page.getByRole('button', { name: 'Inspect lifecycle history' }).click();
    const history = this.page.getByRole('region', { name: 'Lifecycle audit evidence' });
    for (const action of [
      'Uploaded',
      'Scan completed',
      'Validation started',
      'Validation completed',
      'Draft imported',
      'Warnings acknowledged',
      'Approved',
      'Published',
      'Version comparison viewed',
      'Retired',
    ]) {
      await expect(history).toContainText(action);
    }
    await expect(history).toContainText('author');
    await expect(history).toContainText('reviewer');
    await expect(history).toContainText('administrator');
    await expect(history).toContainText('2.0.0');
    await expect(history).toContainText('sha256:');
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1200 });
    await this.page.addStyleTag({
      content: '.statusbar { visibility: hidden !important; }',
    });
    await expect(
      this.page.getByRole('region', { name: 'Lifecycle operational evidence' }),
    ).toHaveScreenshot('lifecycle-operational-evidence.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
    await expect(
      this.page.getByRole('region', { name: 'Lifecycle audit evidence' }),
    ).toHaveScreenshot('lifecycle-audit-evidence.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
  }

  private async publishPackage(
    request: APIRequestContext,
    curriculumPackage: object,
  ): Promise<{ importId: string; versionId: string }> {
    const upload = await request.post(`${this.apiBaseUrl}/curriculum-imports`, {
      headers: this.personaHeaders('author'),
      multipart: {
        package: {
          name: 'lifecycle-audit.json',
          mimeType: 'application/json',
          buffer: Buffer.from(JSON.stringify(curriculumPackage)),
        },
      },
    });
    expect(upload.ok()).toBeTruthy();
    const receipt = (await upload.json()) as { id: string };
    let draft:
      | {
          checksum: string;
          status: string;
          validationReport: { issueChecksum: string; warningCount: number };
        }
      | undefined;
    for (let attempt = 0; attempt < 50; attempt++) {
      const response = await request.get(`${this.apiBaseUrl}/curriculum-imports/${receipt.id}`, {
        headers: this.personaHeaders('author'),
      });
      const status = (await response.json()) as typeof draft;
      if (status?.status === 'Draft') {
        draft = status;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(draft?.status).toBe('Draft');

    if (draft!.validationReport.warningCount > 0) {
      const acknowledgement = await request.post(
        `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/warning-acknowledgements`,
        {
          headers: this.personaHeaders('reviewer'),
          data: {
            packageChecksum: draft!.checksum,
            issueChecksum: draft!.validationReport.issueChecksum,
            rationale: 'Reviewed exact warnings before lifecycle audit.',
          },
        },
      );
      expect(acknowledgement.ok()).toBeTruthy();
    }
    const approval = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/review-decisions`,
      {
        headers: this.personaHeaders('reviewer'),
        data: {
          decision: 'approved',
          checksum: draft!.checksum,
          validationIssueChecksum: draft!.validationReport.issueChecksum,
          rationale: 'Approved exact lifecycle audit fixture.',
        },
      },
    );
    expect(approval.ok()).toBeTruthy();
    const publication = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/publish`,
      {
        headers: this.personaHeaders('administrator'),
        data: {},
      },
    );
    expect(publication.ok()).toBeTruthy();
    const status = (await publication.json()) as { publication: { versionId: string } };
    return { importId: receipt.id, versionId: status.publication.versionId };
  }

  private personaHeaders(persona: string): Record<string, string> {
    return { 'X-RepoFluent-Dev-User': persona };
  }
}
