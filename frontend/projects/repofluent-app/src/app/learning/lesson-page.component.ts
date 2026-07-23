import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LessonView, RepoFluentApiService } from 'api';
import { LessonRendererComponent } from 'components';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-lesson-page',
  imports: [LessonRendererComponent, RouterLink],
  templateUrl: './lesson-page.component.html',
  styleUrl: './lesson-page.component.scss',
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
