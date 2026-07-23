import type { CourseModule } from './course-module';
import type { LearningObjective } from './learning-objective';

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  audience: string[];
  tags: string[];
  isRequired: boolean;
  order: number;
  prerequisites: string[];
  completionRules: string[];
  objectives: LearningObjective[];
  modules: CourseModule[];
}
