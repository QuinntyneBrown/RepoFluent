import type { RenderableBlock } from './renderable-block';
import type { RenderableLearningObjective } from './renderable-learning-objective';

export interface RenderableLesson {
  title: string;
  estimatedMinutes: number;
  objectives: RenderableLearningObjective[];
  blocks: RenderableBlock[];
}
