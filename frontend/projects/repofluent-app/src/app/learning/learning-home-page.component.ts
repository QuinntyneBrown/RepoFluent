import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningAssignment, RepoFluentApiService } from 'api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-learning-home-page',
  imports: [RouterLink],
  template: `
    <header class="page-heading">
      <p class="eyebrow">Recommended next</p>
      <h1>My learning</h1>
      <p>Continue assigned codebase learning from one trusted place.</p>
    </header>

    @if (isLoading()) {
      <p role="status">Loading assigned learning…</p>
    } @else if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (assignments().length === 0) {
      <section class="empty">
        <h2>No learning assigned</h2>
        <p>Your assigned published curricula will appear here.</p>
      </section>
    } @else {
      <section class="assignment-list" aria-label="Assigned learning">
        @for (assignment of assignments(); track assignment.id) {
          <article class="assignment-card">
            <div class="assignment-card__status">
              <span>{{ assignment.isRequired ? 'Required' : 'Optional' }}</span>
              <span>Not started</span>
            </div>
            <h2>{{ assignment.title }}</h2>
            <p>{{ assignment.description }}</p>
            <div class="next-action">
              <span>Why this is next</span>
              <strong>{{ assignment.nextAction }}</strong>
            </div>
            <a
              class="primary-link"
              [routerLink]="[
                '/learning/versions',
                assignment.publishedVersionId,
                'courses',
                assignment.firstCourseId,
              ]"
            >
              Start course
            </a>
          </article>
        }
      </section>
    }
  `,
  styles: `
    .page-heading {
      margin-bottom: var(--rf-space-9);
    }
    .eyebrow {
      color: var(--rf-color-primary);
      font: var(--rf-type-overline);
      letter-spacing: var(--rf-tracking-caps);
      text-transform: uppercase;
    }
    h1 {
      font: var(--rf-type-page-title);
      margin: var(--rf-space-2) 0;
    }
    .assignment-list {
      display: grid;
      gap: var(--rf-space-6);
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
    }
    .assignment-card,
    .empty {
      background: var(--rf-color-surface-1);
      border: 1px solid var(--rf-color-line);
      border-radius: var(--rf-radius-panel);
      padding: var(--rf-space-7);
    }
    .assignment-card__status {
      color: var(--rf-color-primary);
      display: flex;
      font: var(--rf-type-label);
      justify-content: space-between;
      text-transform: uppercase;
    }
    .next-action {
      background: var(--rf-color-surface-2);
      display: grid;
      gap: var(--rf-space-2);
      margin: var(--rf-space-6) 0;
      padding: var(--rf-space-4);
    }
    .next-action span {
      color: var(--rf-color-ink-muted);
      font: var(--rf-type-label);
    }
    .primary-link {
      background: var(--rf-color-primary);
      border-radius: var(--rf-radius-control);
      color: var(--rf-color-ink-inverse);
      display: inline-flex;
      font-weight: 700;
      padding: var(--rf-space-3) var(--rf-space-5);
      text-decoration: none;
    }
    .error {
      color: var(--rf-color-danger);
    }
  `,
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
