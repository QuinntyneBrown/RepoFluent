import type { LessonBlock } from './lesson-block';

export interface Lesson {
  id: string;
  title: string;
  estimatedMinutes: number;
  objectives: string[];
  blocks: LessonBlock[];
}
