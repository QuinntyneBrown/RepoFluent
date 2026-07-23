import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevPersonaService, ImportStatus, Preview, RepoFluentApiService } from 'api';
import { LessonRendererComponent } from 'components';
import { firstValueFrom } from 'rxjs';

const importStorageKey = 'repofluent-current-import';

@Component({
  selector: 'app-curriculum-page',
  imports: [FormsModule, LessonRendererComponent],
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
  }

  protected async upload(): Promise<void> {
    if (!this.selectedFile) {
      this.error.set('Choose a curriculum package first.');
      return;
    }

    await this.run(async () => {
      const receipt = await firstValueFrom(this.api.upload(this.selectedFile!));
      localStorage.setItem(importStorageKey, receipt.id);
      await this.pollUntilValidated(receipt.id);
    });
  }

  protected async openPreview(): Promise<void> {
    const current = this.status();
    if (!current) return;
    await this.run(async () =>
      this.preview.set(await firstValueFrom(this.api.getPreview(current.id))),
    );
  }

  protected async approve(): Promise<void> {
    const current = this.status();
    if (!current) return;
    await this.run(async () => {
      this.status.set(await firstValueFrom(this.api.approve(current.id, current.checksum)));
    });
  }

  protected async publish(): Promise<void> {
    const current = this.status();
    if (!current) return;
    await this.run(async () => this.status.set(await firstValueFrom(this.api.publish(current.id))));
  }

  protected async assign(): Promise<void> {
    const versionId = this.status()?.publishedVersionId;
    if (!versionId) return;
    await this.run(async () => {
      await firstValueFrom(this.api.assign(versionId, this.learnerId, this.isRequired));
      this.message.set('Assignment created');
    });
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
    for (let attempt = 0; attempt < 50; attempt++) {
      const value = await firstValueFrom(this.api.getImport(id));
      this.status.set(value);
      if (value.status === 'Draft' || value.status === 'ValidationFailed') return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Validation did not complete in time.');
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.isBusy.set(true);
    this.error.set('');
    this.message.set('');
    try {
      await action();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'The request could not be completed.',
      );
    } finally {
      this.isBusy.set(false);
    }
  }
}
