import type { RenderableBlock } from './renderable-block';

export interface RenderableLesson {
  title: string;
  estimatedMinutes: number;
  objectives: string[];
  blocks: RenderableBlock[];
}
