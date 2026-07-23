import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

export class CurriculumVersionGovernancePage {
  private readonly apiBaseUrl = `${
    process.env['REPOFLUENT_API_BASE_URL'] ?? 'http://127.0.0.1:5080'
  }/api`;
  private versionOneId = '';
  private versionTwoId = '';
  private versionTwoImportId = '';

  constructor(private readonly page: Page) {}

  async createPublishedVersions(request: APIRequestContext): Promise<void> {
    const packagePath = path.resolve(
      process.cwd(),
      '..',
      'contracts/curriculum/0.1.0/fixtures/order-processing.json',
    );
    const versionOne = JSON.parse(await readFile(packagePath, 'utf8')) as {
      packageId: string;
      version: string;
      title: string;
      sourceSnapshot: {
        repositories: Array<{ id: string; revision: string; commit: string }>;
      };
      courses: Array<{
        modules: Array<{
          id: string;
          title: string;
          order: number;
          lessons: Array<{
            id: string;
            title: string;
            objectives: Array<{ id: string; statement: string }>;
            blocks: Array<Record<string, unknown>>;
          }>;
        }>;
      }>;
      assessments: Array<{
        pools: Array<{ items: Array<Record<string, unknown>> }>;
      }>;
    };
    versionOne.packageId = 'version-governance-foundations';
    versionOne.title = 'Version Governance Foundations';
    const firstModule = versionOne.courses[0]!.modules[0]!;
    const secondModule = structuredClone(firstModule);
    secondModule.id = 'operational-follow-through-module';
    secondModule.title = 'Operational follow-through';
    secondModule.order = 2;
    secondModule.lessons[0]!.id = 'operational-follow-through';
    secondModule.lessons[0]!.title = 'Observe the workflow handoff';
    secondModule.lessons[0]!.objectives[0]!.id = 'observe-handoff';
    secondModule.lessons[0]!.objectives[1]!.id = 'explain-retry';
    versionOne.courses[0]!.modules.push(secondModule);

    const questions = versionOne.assessments[0]!.pools[0]!.items;
    const secondQuestion = structuredClone(questions[0]!);
    secondQuestion['id'] = 'durable-order-retry';
    secondQuestion['prompt'] = 'What lets a retry observe the durable order?';
    questions.push(secondQuestion);

    const publishedOne = await this.publishPackage(request, versionOne);
    this.versionOneId = publishedOne.versionId;
    await this.assignVersion(request, this.versionOneId);

    const versionTwo = structuredClone(versionOne);
    versionTwo.version = '2.0.0';
    versionTwo.title = 'Version Governance Foundations!';
    const repository = versionTwo.sourceSnapshot.repositories.find(
      (item) => item.id === 'order-service',
    )!;
    repository.revision = '9a35d2b';
    repository.commit = '9a35d2b';
    for (const module of versionTwo.courses[0]!.modules) {
      for (const lesson of module.lessons) {
        const codeReference = lesson.blocks.find(
          (block) => block['type'] === 'codeReference' && block['repositoryId'] === 'order-service',
        );
        if (codeReference) codeReference['commit'] = '9a35d2b';
      }
    }
    versionTwo.assessments[0]!.pools[0]!.items.pop();
    versionTwo.courses[0]!.modules = [
      versionTwo.courses[0]!.modules[1]!,
      versionTwo.courses[0]!.modules[0]!,
    ];
    versionTwo.courses[0]!.modules[0]!.order = 1;
    versionTwo.courses[0]!.modules[1]!.order = 2;

    const publishedTwo = await this.publishPackage(request, versionTwo);
    this.versionTwoId = publishedTwo.versionId;
    this.versionTwoImportId = publishedTwo.importId;
    await this.assignVersion(request, this.versionTwoId);
  }

  async openComparisonAsReviewer(): Promise<void> {
    await this.page.addInitScript(
      ({ importId }) => {
        localStorage.setItem('repofluent-development-persona', 'reviewer');
        localStorage.setItem('repofluent-current-import', importId);
      },
      { importId: this.versionTwoImportId },
    );
    await this.page.goto('/');
    await this.page.getByLabel('Base published version').fill(this.versionOneId);
    await this.page.getByRole('button', { name: 'Compare versions' }).click();

    const comparison = this.page.getByRole('region', { name: 'Version comparison evidence' });
    await expect(comparison).toContainText('Semantic version comparison');
    await expect(comparison).toContainText('1.0.0 → 2.0.0');
    await expect(comparison).toContainText('Source changed');
    await expect(comparison).toContainText('Assessment changed');
    await expect(comparison).toContainText('Reordered');
    await expect(comparison).toContainText('Removed');
    await expect(comparison).toContainText('Presentational');
    await expect(comparison).toContainText('Learner refresh required');
    await expect(comparison).toContainText('No learner refresh');
    await expect(comparison).toContainText('trace-order');
  }

  async retireVersionAsAdministrator(request: APIRequestContext): Promise<void> {
    await this.page.getByLabel('Development persona').selectOption('administrator');
    await this.page
      .getByLabel('Retirement reason')
      .fill('Superseded by a reviewed corrective version.');
    await this.page.getByRole('button', { name: 'Retire version' }).click();

    const retirement = this.page.getByRole('region', { name: 'Retirement evidence' });
    await expect(retirement).toContainText('Retired');
    await expect(retirement).toContainText('No new assignment');
    await expect(retirement).toContainText('Existing assignments continue');
    await expect(retirement).toContainText('Historical content retained');
    await expect(retirement).toContainText('Superseded by a reviewed corrective version.');

    const blockedAssignment = await request.post(`${this.apiBaseUrl}/assignments`, {
      headers: this.personaHeaders('administrator'),
      data: {
        publishedVersionId: this.versionTwoId,
        learnerId: 'learner',
        isRequired: false,
      },
    });
    expect(blockedAssignment.status()).toBe(404);

    const retainedLesson = await request.get(
      `${this.apiBaseUrl}/learning/versions/${this.versionTwoId}/courses/order-processing-course/lessons/order-becomes-workflow`,
      { headers: this.personaHeaders('learner') },
    );
    expect(retainedLesson.ok()).toBeTruthy();
  }

  async expectVisualContract(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 1200 });
    await this.page.addStyleTag({
      content: `
        .statusbar { visibility: hidden !important; }
        [aria-label='Version comparison evidence'] {
          box-sizing: border-box;
          height: 1400px;
          overflow: hidden;
        }
      `,
    });
    await expect(
      this.page.getByRole('region', { name: 'Version comparison evidence' }),
    ).toHaveScreenshot('compare-semantic-versions.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.08,
    });
    await expect(this.page.getByRole('region', { name: 'Retirement evidence' })).toHaveScreenshot(
      'retire-version.png',
      {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.08,
      },
    );
  }

  private async publishPackage(
    request: APIRequestContext,
    curriculumPackage: object,
  ): Promise<{ importId: string; versionId: string }> {
    const upload = await request.post(`${this.apiBaseUrl}/curriculum-imports`, {
      headers: this.personaHeaders('author'),
      multipart: {
        package: {
          name: 'version-governance.json',
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
            rationale: 'Reviewed exact warnings before version governance.',
          },
        },
      );
      expect(acknowledgement.ok()).toBeTruthy();
    }

    const review = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/review-decisions`,
      {
        headers: this.personaHeaders('reviewer'),
        data: {
          decision: 'approved',
          checksum: draft!.checksum,
          validationIssueChecksum: draft!.validationReport.issueChecksum,
          rationale: 'Approved exact version governance fixture.',
        },
      },
    );
    expect(review.ok()).toBeTruthy();

    const publication = await request.post(
      `${this.apiBaseUrl}/curriculum-drafts/${receipt.id}/publish`,
      {
        headers: this.personaHeaders('administrator'),
        data: {},
      },
    );
    expect(publication.ok()).toBeTruthy();
    const status = (await publication.json()) as {
      publication: { versionId: string };
    };
    return { importId: receipt.id, versionId: status.publication.versionId };
  }

  private async assignVersion(request: APIRequestContext, versionId: string): Promise<void> {
    const assignment = await request.post(`${this.apiBaseUrl}/assignments`, {
      headers: this.personaHeaders('administrator'),
      data: {
        publishedVersionId: versionId,
        learnerId: 'learner',
        isRequired: true,
      },
    });
    expect(assignment.ok()).toBeTruthy();
  }

  private personaHeaders(persona: string): Record<string, string> {
    return { 'X-RepoFluent-Dev-User': persona };
  }
}
