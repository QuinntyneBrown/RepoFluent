import type { CourseModule } from './course-module';

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  objectives: string[];
  modules: CourseModule[];
}
