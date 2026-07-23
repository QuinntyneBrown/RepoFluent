import type { AnswerDefinition } from './answer-definition';
import type { GradingDefinition } from './grading-definition';

export interface AssessmentItem {
  id: string;
  type: string;
  prompt: string;
  options: string[] | null;
  rationale: string | null;
  grading: GradingDefinition;
  answer: AnswerDefinition;
}
