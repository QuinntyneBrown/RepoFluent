import type { LessonBlock } from './lesson-block';
import type { LearningObjective } from './learning-objective';

export interface Lesson {
  id: string;
  title: string;
  estimatedMinutes: number;
  difficulty: string;
  audience: string[];
  tags: string[];
  isRequired: boolean;
  order: number;
  prerequisites: string[];
  completionRules: string[];
  objectives: LearningObjective[];
  blocks: LessonBlock[];
}
