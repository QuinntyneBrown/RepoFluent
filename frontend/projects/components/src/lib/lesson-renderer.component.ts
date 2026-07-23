import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RenderableLesson } from './renderable-lesson';

@Component({
  selector: 'rf-lesson-renderer',
  templateUrl: './lesson-renderer.component.html',
  styleUrl: './lesson-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonRendererComponent {
  readonly lesson = input.required<RenderableLesson>();
}
