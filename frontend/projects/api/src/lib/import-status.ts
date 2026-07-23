import type { CurriculumStatus } from './curriculum-status';
import type { Publication } from './publication';
import type { Retirement } from './retirement';
import type { ReviewDecision } from './review-decision';
import type { ValidationIssue } from './validation-issue';
import type { ValidationReport } from './validation-report';
import type { WarningAcknowledgement } from './warning-acknowledgement';

export interface ImportStatus {
  id: string;
  title: string;
  checksum: string;
  status: CurriculumStatus;
  issues: ValidationIssue[];
  publishedVersionId: string | null;
  allowedActions: string[];
  correlationId: string;
  validationReport: ValidationReport | null;
  warningAcknowledgement: WarningAcknowledgement | null;
  packageId: string;
  packageVersion: string;
  validationAttemptCount: number;
  reviewDecision: ReviewDecision | null;
  publication: Publication | null;
  retirement: Retirement | null;
}
