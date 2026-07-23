import type { WarningAcknowledgement } from './warning-acknowledgement';

export interface ReviewDecision {
  reviewerId: string;
  tenantId: string;
  packageId: string;
  packageVersion: string;
  packageChecksum: string;
  validationIssueChecksum: string;
  decision: string;
  decidedAt: string;
  warningAcknowledgement: WarningAcknowledgement | null;
  rationale: string | null;
}
