import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseView, RepoFluentApiService } from 'api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-course-page',
  imports: [RouterLink],
  templateUrl: './course-page.component.html',
  styleUrl: './course-page.component.scss',
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
