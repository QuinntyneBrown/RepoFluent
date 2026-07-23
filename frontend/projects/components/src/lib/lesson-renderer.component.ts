import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface RenderableLesson {
  title: string;
  estimatedMinutes: number;
  objectives: string[];
  blocks: RenderableBlock[];
}

export interface RenderableBlock {
  type: string;
  text?: string;
  tone?: string;
  title?: string;
  path?: string;
  language?: string;
  startLine?: number;
  endLine?: number;
  symbol?: string;
  explanation?: string;
}

@Component({
  selector: 'rf-lesson-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="lesson">
      <header>
        <p class="lesson__meta">Lesson · {{ lesson().estimatedMinutes }} min</p>
        <h1>{{ lesson().title }}</h1>
        <section class="lesson__objectives" aria-labelledby="objectives-title">
          <h2 id="objectives-title">By the end, you can</h2>
          <ul>
            @for (objective of lesson().objectives; track objective) {
              <li>{{ objective }}</li>
            }
          </ul>
        </section>
      </header>

      <div class="lesson__body">
        @for (block of lesson().blocks; track $index) {
          @switch (block.type) {
            @case ('prose') {
              <p>{{ block.text }}</p>
            }
            @case ('callout') {
              <aside class="callout">
                <strong>{{ block.title }}</strong>
                <p>{{ block.text }}</p>
              </aside>
            }
            @case ('codeReference') {
              <section class="code-reference" aria-label="Source code reference">
                <div>
                  <span>Source reference</span>
                  <strong>{{ block.symbol }}</strong>
                </div>
                <code>{{ block.path }}</code>
                <p>Lines {{ block.startLine }}–{{ block.endLine }} · {{ block.language }}</p>
                <p>{{ block.explanation }}</p>
              </section>
            }
            @default {
              <div class="block-error" role="status">
                This content block is unavailable. Support code LEX-BLOCK-UNSUPPORTED.
              </div>
            }
          }
        }
      </div>
    </article>
  `,
  styles: `
    .lesson {
      display: grid;
      gap: var(--rf-space-8);
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.5fr);
    }
    h1 {
      font: var(--rf-type-page-title);
      margin: var(--rf-space-2) 0 var(--rf-space-7);
    }
    h2 {
      font: var(--rf-type-title);
    }
    .lesson__meta,
    .code-reference span {
      color: var(--rf-color-ink-muted);
      font: var(--rf-type-overline);
      letter-spacing: var(--rf-tracking-caps);
      text-transform: uppercase;
    }
    .lesson__objectives,
    .callout,
    .code-reference,
    .block-error {
      background: var(--rf-color-surface-2);
      border: 1px solid var(--rf-color-line);
      border-radius: var(--rf-radius-panel);
      padding: var(--rf-space-6);
    }
    .lesson__body > p {
      font-size: 1.05rem;
      line-height: 1.8;
    }
    .lesson__body {
      display: grid;
      gap: var(--rf-space-6);
    }
    .callout {
      border-left: 3px solid var(--rf-color-info);
    }
    .code-reference {
      display: grid;
      gap: var(--rf-space-3);
    }
    .code-reference div {
      display: flex;
      justify-content: space-between;
    }
    .code-reference code {
      color: var(--rf-color-primary);
      font: var(--rf-type-code);
      overflow-wrap: anywhere;
    }
    .block-error {
      border-color: var(--rf-color-danger);
    }
    @media (max-width: 48rem) {
      .lesson {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class LessonRendererComponent {
  readonly lesson = input.required<RenderableLesson>();
}
