import type { Lesson } from './lesson';

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}
