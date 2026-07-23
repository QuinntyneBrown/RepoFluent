import type { CurriculumStatus } from './curriculum-status';
import type { ValidationIssue } from './validation-issue';

export interface ImportStatus {
  id: string;
  title: string;
  checksum: string;
  status: CurriculumStatus;
  issues: ValidationIssue[];
  publishedVersionId: string | null;
  allowedActions: string[];
  correlationId: string;
}
