import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ContractRelease, RepoFluentApiService } from 'api';
import { firstValueFrom } from 'rxjs';
import { ContractReleasePanelComponent } from '../curriculum/contract-release-panel.component';

@Component({
  selector: 'app-contract-release-page',
  imports: [ContractReleasePanelComponent],
  templateUrl: './contract-release-page.component.html',
  styleUrl: './contract-release-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractReleasePageComponent implements OnInit {
  private readonly api = inject(RepoFluentApiService);

  protected readonly release = signal<ContractRelease | null>(null);
  protected readonly error = signal('');

  ngOnInit(): void {
    void this.loadRelease();
  }

  private async loadRelease(): Promise<void> {
    try {
      this.release.set(await firstValueFrom(this.api.getContractRelease()));
    } catch {
      this.error.set('Published contract evidence is temporarily unavailable.');
    }
  }
}
