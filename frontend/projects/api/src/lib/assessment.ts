import type { AssessmentMapping } from './assessment-mapping';
import type { AssessmentSelection } from './assessment-selection';
import type { QuestionPool } from './question-pool';

export interface Assessment {
  id: string;
  title: string;
  purpose: string;
  selection: AssessmentSelection;
  thresholdPercent: number;
  maximumAttempts: number;
  timeLimitMinutes: number | null;
  feedbackRelease: string;
  mappings: AssessmentMapping;
  pools: QuestionPool[];
}
