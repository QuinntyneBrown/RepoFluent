import type { AssessmentItem } from './assessment-item';

export interface QuestionPool {
  id: string;
  title: string;
  items: AssessmentItem[];
}
