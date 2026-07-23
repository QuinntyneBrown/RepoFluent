import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AuthoringKitRelease, RepoFluentApiService } from 'api';
import { firstValueFrom } from 'rxjs';
import { AuthoringEvidencePolicyComponent } from './authoring-evidence-policy.component';
import { AuthoringGenerationPolicyComponent } from './authoring-generation-policy.component';
import { AuthoringScopePolicyComponent } from './authoring-scope-policy.component';
import { AuthoringValidatorPolicyComponent } from './authoring-validator-policy.component';

@Component({
  selector: 'app-authoring-kit-page',
  templateUrl: './authoring-kit-page.component.html',
  styleUrl: './authoring-kit-page.component.scss',
  imports: [
    AuthoringScopePolicyComponent,
    AuthoringEvidencePolicyComponent,
    AuthoringGenerationPolicyComponent,
    AuthoringValidatorPolicyComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthoringKitPageComponent implements OnInit {
  private readonly api = inject(RepoFluentApiService);

  protected readonly release = signal<AuthoringKitRelease | null>(null);
  protected readonly error = signal('');

  ngOnInit(): void {
    void this.loadRelease();
  }

  protected shortChecksum(checksum: string): string {
    return `${checksum.slice(0, 14)}…${checksum.slice(-8)}`;
  }

  private async loadRelease(): Promise<void> {
    try {
      this.release.set(await firstValueFrom(this.api.getAuthoringKitRelease()));
    } catch {
      this.error.set('The published authoring-kit evidence is temporarily unavailable.');
    }
  }
}
