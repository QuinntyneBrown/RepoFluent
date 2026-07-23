import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LessonView, RepoFluentApiService } from 'api';
import { LessonRendererComponent } from 'components';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-lesson-page',
  imports: [LessonRendererComponent, RouterLink],
  template: `
    @if (lesson(); as view) {
      <nav class="lesson-nav" aria-label="Lesson context">
        <a [routerLink]="['/learning/versions', view.publishedVersionId, 'courses', courseId]">
          ← {{ view.courseTitle }}
        </a>
        <span>Published version</span>
      </nav>
      <rf-lesson-renderer [lesson]="view.lesson" />
    } @else if (error()) {
      <p role="alert">{{ error() }}</p>
    } @else {
      <p role="status">Loading lesson…</p>
    }
  `,
  styles: `
    .lesson-nav {
      align-items: center;
      border-bottom: 1px solid var(--rf-color-line);
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--rf-space-8);
      padding-bottom: var(--rf-space-5);
    }
    .lesson-nav a {
      color: var(--rf-color-link);
    }
    .lesson-nav span {
      color: var(--rf-color-primary);
      font: var(--rf-type-overline);
      text-transform: uppercase;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonPageComponent implements OnInit {
  private readonly api = inject(RepoFluentApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly lesson = signal<LessonView | null>(null);
  protected readonly error = signal('');
  protected readonly courseId = this.route.snapshot.paramMap.get('courseId')!;

  async ngOnInit(): Promise<void> {
    const versionId = this.route.snapshot.paramMap.get('versionId')!;
    const lessonId = this.route.snapshot.paramMap.get('lessonId')!;
    try {
      this.lesson.set(await firstValueFrom(this.api.getLesson(versionId, this.courseId, lessonId)));
    } catch {
      this.error.set('This assigned lesson is unavailable.');
    }
  }
}
