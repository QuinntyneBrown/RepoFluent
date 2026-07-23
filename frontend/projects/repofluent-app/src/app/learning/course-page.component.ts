import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseView, RepoFluentApiService } from 'api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-course-page',
  imports: [RouterLink],
  template: `
    <a class="back-link" routerLink="/learning">← My learning</a>
    @if (course(); as view) {
      <header class="course-heading">
        <div>
          <p class="eyebrow">
            {{ view.course.difficulty }} · {{ view.course.estimatedMinutes }} min
          </p>
          <h1>{{ view.course.title }}</h1>
          <p>{{ view.course.description }}</p>
        </div>
        <section aria-labelledby="outcomes-title">
          <h2 id="outcomes-title">Course outcomes</h2>
          <ul>
            @for (objective of view.course.objectives; track objective) {
              <li>{{ objective }}</li>
            }
          </ul>
        </section>
      </header>

      <section class="outline" aria-labelledby="outline-title">
        <h2 id="outline-title">Course outline</h2>
        @for (module of view.course.modules; track module.id; let moduleIndex = $index) {
          <div class="module">
            <p>Module {{ moduleIndex + 1 }}</p>
            <h3>{{ module.title }}</h3>
            <ol>
              @for (lesson of module.lessons; track lesson.id) {
                <li>
                  <a
                    [routerLink]="[
                      '/learning/versions',
                      view.publishedVersionId,
                      'courses',
                      view.course.id,
                      'lessons',
                      lesson.id,
                    ]"
                  >
                    <strong>{{ lesson.title }}</strong>
                    <span>{{ lesson.estimatedMinutes }} min</span>
                  </a>
                </li>
              }
            </ol>
          </div>
        }
      </section>
    } @else if (error()) {
      <p role="alert">{{ error() }}</p>
    } @else {
      <p role="status">Loading course…</p>
    }
  `,
  styles: `
    .back-link {
      color: var(--rf-color-link);
    }
    .course-heading {
      display: grid;
      gap: var(--rf-space-8);
      grid-template-columns: 1.4fr 1fr;
      margin: var(--rf-space-8) 0;
    }
    .course-heading section,
    .outline {
      background: var(--rf-color-surface-1);
      border: 1px solid var(--rf-color-line);
      border-radius: var(--rf-radius-panel);
      padding: var(--rf-space-7);
    }
    .eyebrow,
    .module > p {
      color: var(--rf-color-primary);
      font: var(--rf-type-overline);
      letter-spacing: var(--rf-tracking-caps);
      text-transform: uppercase;
    }
    h1 {
      font: var(--rf-type-page-title);
      margin: var(--rf-space-2) 0;
    }
    .module {
      border-top: 1px solid var(--rf-color-line);
      padding-top: var(--rf-space-6);
    }
    ol {
      list-style: none;
      padding: 0;
    }
    li a {
      align-items: center;
      border-top: 1px solid var(--rf-color-line);
      color: var(--rf-color-ink-strong);
      display: flex;
      justify-content: space-between;
      padding: var(--rf-space-5);
      text-decoration: none;
    }
    li a:hover {
      background: var(--rf-color-surface-hover);
    }
    li span {
      color: var(--rf-color-ink-muted);
    }
    @media (max-width: 48rem) {
      .course-heading {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursePageComponent implements OnInit {
  private readonly api = inject(RepoFluentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly course = signal<CourseView | null>(null);
  protected readonly error = signal('');

  async ngOnInit(): Promise<void> {
    const versionId = this.route.snapshot.paramMap.get('versionId')!;
    const courseId = this.route.snapshot.paramMap.get('courseId')!;
    try {
      this.course.set(await firstValueFrom(this.api.getCourse(versionId, courseId)));
    } catch {
      this.error.set('This assigned course is unavailable.');
    }
  }
}
