import { TestBed } from '@angular/core/testing';
import { LessonRendererComponent } from './lesson-renderer.component';
import type { RenderableLesson } from './renderable-lesson';

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

  it('reveals large lessons in semantic batches and focuses the first new block', async () => {
    await TestBed.configureTestingModule({
      imports: [LessonRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(LessonRendererComponent);
    const lesson: RenderableLesson = {
      title: 'Progressive rendering',
      estimatedMinutes: 15,
      objectives: ['Navigate long content'],
      blocks: Array.from({ length: 12 }, (_, index) => ({
        type: 'prose',
        text: `Lesson block ${index + 1}`,
      })),
    };
    fixture.componentRef.setInput('lesson', lesson);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.lesson-block')).toHaveLength(10);
    const reveal = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.includes('Show 2 more lesson blocks'));
    reveal?.click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));

    const firstRevealed = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-block-index="10"]',
    );
    expect(fixture.nativeElement.querySelectorAll('.lesson-block')).toHaveLength(12);
    expect(document.activeElement).toBe(firstRevealed);
  });
});
