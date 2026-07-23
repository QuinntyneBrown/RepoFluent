import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevPersonaService, ImportStatus, Preview, RepoFluentApiService } from 'api';
import { LessonRendererComponent } from 'components';
import { firstValueFrom } from 'rxjs';
import { ContractModelWorkbenchComponent } from './contract-model-workbench.component';

const importStorageKey = 'repofluent-current-import';

@Component({
  selector: 'app-curriculum-page',
  imports: [FormsModule, LessonRendererComponent, ContractModelWorkbenchComponent],
  templateUrl: './curriculum-page.component.html',
  styleUrl: './curriculum-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurriculumPageComponent {
  private readonly api = inject(RepoFluentApiService);
  private readonly personas = inject(DevPersonaService);
  private selectedFile: File | null = null;

  protected readonly status = signal<ImportStatus | null>(null);
  protected readonly preview = signal<Preview | null>(null);
  protected readonly isBusy = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly packageError = signal('');
  protected readonly operationStatus = signal('Ready for a curriculum package');
  protected readonly lastReceiptWasReplay = signal(false);
  protected learnerId = 'learner';
  protected isRequired = false;

  constructor() {
    effect(() => {
      this.personas.current();
      void this.restoreImport();
    });
  }

  protected chooseFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.item(0) ?? null;
    if (this.selectedFile) {
      this.packageError.set('');
      this.operationStatus.set('Curriculum package selected');
    }
  }

  protected async upload(): Promise<void> {
    if (this.isBusy()) return;
    if (!this.selectedFile) {
      this.packageError.set('Choose a curriculum package first.');
      this.operationStatus.set('Curriculum package is required');
      return;
    }

    this.packageError.set('');
    await this.run(
      async () => {
        const receipt = await firstValueFrom(this.api.upload(this.selectedFile!));
        this.lastReceiptWasReplay.set(receipt.isReplay);
        localStorage.setItem(importStorageKey, receipt.id);
        this.operationStatus.set('Validating curriculum package');
        await this.pollUntilValidated(receipt.id);
      },
      'Uploading curriculum package',
      () =>
        this.lastReceiptWasReplay()
          ? 'Existing draft reused'
          : 'Curriculum package is ready for review',
    );
  }

  protected async openPreview(): Promise<void> {
    const current = this.status();
    if (!current) return;
    await this.run(
      async () => this.preview.set(await firstValueFrom(this.api.getPreview(current.id))),
      'Loading draft preview',
      'Draft preview loaded',
    );
  }

  protected hasBlockingIssues(status: ImportStatus): boolean {
    return status.issues.some((issue) => issue.isBlocking);
  }

  protected titleCase(value: string): string {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  }

  protected async approve(): Promise<void> {
    const current = this.status();
    if (!current) return;
    await this.run(
      async () => {
        this.status.set(await firstValueFrom(this.api.approve(current.id, current.checksum)));
      },
      'Approving curriculum checksum',
      'Curriculum checksum approved',
    );
  }

  protected async acknowledgeWarnings(): Promise<void> {
    const current = this.status();
    const report = current?.validationReport;
    if (!current || !report) return;
    await this.run(
      async () => {
        this.status.set(
          await firstValueFrom(
            this.api.acknowledgeWarnings(current.id, current.checksum, report.issueChecksum),
          ),
        );
      },
      'Acknowledging exact warning report',
      'Warnings acknowledged',
    );
  }

  protected async publish(): Promise<void> {
    const current = this.status();
    if (!current) return;
    await this.run(
      async () => this.status.set(await firstValueFrom(this.api.publish(current.id))),
      'Publishing curriculum version',
      'Curriculum version published',
    );
  }

  protected async assign(): Promise<void> {
    const versionId = this.status()?.publishedVersionId;
    if (!versionId) return;
    await this.run(
      async () => {
        await firstValueFrom(this.api.assign(versionId, this.learnerId, this.isRequired));
        this.message.set('Assignment created');
      },
      'Assigning published curriculum',
      'Assignment created',
    );
  }

  protected statusLabel(value: ImportStatus): string {
    const labels: Record<ImportStatus['status'], string> = {
      Received: 'Queued for validation',
      Validating: 'Validating',
      ValidationFailed: 'Validation failed',
      Draft: 'Ready for review',
      Approved: 'Approved',
      Rejected: 'Rejected',
      Published: 'Published',
    };
    return labels[value.status];
  }

  private async restoreImport(): Promise<void> {
    const id = localStorage.getItem(importStorageKey);
    if (!id || this.personas.current() === 'learner') return;
    try {
      this.status.set(await firstValueFrom(this.api.getImport(id)));
      this.error.set('');
    } catch {
      this.status.set(null);
    }
  }

  private async pollUntilValidated(id: string): Promise<void> {
    for (let attempt = 0; attempt < 150; attempt++) {
      const value = await firstValueFrom(this.api.getImport(id));
      this.status.set(value);
      if (value.status === 'Draft' || value.status === 'ValidationFailed') return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Validation did not complete in time.');
  }

  private async run(
    action: () => Promise<void>,
    startingStatus: string,
    completedStatus: string | (() => string),
  ): Promise<void> {
    if (this.isBusy()) return;
    this.isBusy.set(true);
    this.error.set('');
    this.message.set('');
    this.operationStatus.set(startingStatus);
    try {
      await action();
      this.operationStatus.set(
        typeof completedStatus === 'string' ? completedStatus : completedStatus(),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'The request could not be completed.';
      this.error.set(message);
      this.operationStatus.set(`Curriculum operation failed: ${message}`);
    } finally {
      this.isBusy.set(false);
    }
  }
}
