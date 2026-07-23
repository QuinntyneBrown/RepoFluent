import { TestBed } from '@angular/core/testing';
import { LessonRendererComponent, RenderableLesson } from './lesson-renderer.component';

describe('LessonRendererComponent', () => {
  it('keeps valid content usable when an unknown block fails safely', async () => {
    await TestBed.configureTestingModule({
      imports: [LessonRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(LessonRendererComponent);
    const lesson: RenderableLesson = {
      title: 'Safe rendering',
      estimatedMinutes: 5,
      objectives: ['Recognize safe failure'],
      blocks: [
        { type: 'prose', text: 'Visible learning remains available.' },
        { type: 'unsupported' },
      ],
    };
    fixture.componentRef.setInput('lesson', lesson);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Visible learning remains available.');
    expect(text).toContain('LEX-BLOCK-UNSUPPORTED');
  });
});
