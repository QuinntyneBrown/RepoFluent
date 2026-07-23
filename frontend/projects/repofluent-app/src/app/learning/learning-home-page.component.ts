import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningAssignment, RepoFluentApiService } from 'api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-learning-home-page',
  imports: [RouterLink],
  templateUrl: './learning-home-page.component.html',
  styleUrl: './learning-home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningHomePageComponent implements OnInit {
  private readonly api = inject(RepoFluentApiService);
  protected readonly assignments = signal<LearningAssignment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.assignments.set(await firstValueFrom(this.api.getAssignments()));
    } catch {
      this.error.set('Assigned learning could not be loaded for this identity.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
