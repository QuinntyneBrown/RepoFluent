import type { Lesson } from './lesson';

export interface LessonView {
  publishedVersionId: string;
  courseTitle: string;
  lesson: Lesson;
}
