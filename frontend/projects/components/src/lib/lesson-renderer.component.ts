import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ExperiencePlatformAdapter } from './experience-platform-adapter';
import type { RenderableLesson } from './renderable-lesson';

@Component({
  selector: 'rf-lesson-renderer',
  templateUrl: './lesson-renderer.component.html',
  styleUrl: './lesson-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonRendererComponent {
  private static readonly contentBatchSize = 10;
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly experiencePlatform = inject(ExperiencePlatformAdapter);
  private readonly sourceClose = viewChild<ElementRef<HTMLButtonElement>>('sourceClose');
  private sourceInvoker: HTMLElement | null = null;

  readonly lesson = input.required<RenderableLesson>();
  protected readonly visibleBlockCount = signal(LessonRendererComponent.contentBatchSize);
  protected readonly activeSourceIndex = signal<number | null>(this.readSourceIndex());
  protected readonly visibleBlocks = computed(() =>
    this.lesson().blocks.slice(0, this.visibleBlockCount()),
  );
  protected readonly activeSource = computed(() => {
    const index = this.activeSourceIndex();
    return index === null ? null : (this.lesson().blocks[index] ?? null);
  });
  protected readonly remainingBlockCount = computed(() =>
    Math.max(0, this.lesson().blocks.length - this.visibleBlockCount()),
  );

  constructor() {
    const stopListening = this.experiencePlatform.listenForContextChange(() => {
      const previous = this.activeSourceIndex();
      const next = this.readSourceIndex();
      this.activeSourceIndex.set(next);
      if (previous !== null && next === null) {
        queueMicrotask(() => this.restoreSourceFocus());
      }
    });
    this.destroyRef.onDestroy(stopListening);
  }

  protected openSource(index: number, event: Event): void {
    this.sourceInvoker = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.experiencePlatform.openContext('source', index.toString());
    this.activeSourceIndex.set(index);
    setTimeout(() => this.sourceClose()?.nativeElement.focus());
  }

  protected closeSource(): void {
    if (!this.experiencePlatform.closeContext('source')) {
      this.activeSourceIndex.set(null);
      queueMicrotask(() => this.restoreSourceFocus());
    }
  }

  protected showMoreContent(): void {
    const firstRevealedIndex = this.visibleBlockCount();
    this.visibleBlockCount.update((count) =>
      Math.min(count + LessonRendererComponent.contentBatchSize, this.lesson().blocks.length),
    );
    setTimeout(() => {
      const firstRevealed = this.element.nativeElement.querySelector<HTMLElement>(
        `[data-block-index="${firstRevealedIndex}"]`,
      );
      firstRevealed?.scrollIntoView?.({ block: 'center' });
      firstRevealed?.focus({ preventScroll: true });
    });
  }

  protected label(value: string | undefined): string {
    if (!value) return '';
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  }

  private readSourceIndex(): number | null {
    const value = this.experiencePlatform.readContext('source');
    if (value === null) return null;

    const index = Number.parseInt(value, 10);
    return Number.isInteger(index) && index >= 0 ? index : null;
  }

  private restoreSourceFocus(): void {
    this.sourceInvoker?.scrollIntoView?.({ block: 'nearest' });
    this.sourceInvoker?.focus({ preventScroll: true });
    this.sourceInvoker = null;
  }
}
