import type { CurriculumStatus } from './curriculum-status';
import type { LifecycleAuditEntry } from './lifecycle-audit-entry';

export interface LifecycleHistory {
  importId: string;
  packageId: string;
  packageVersion: string;
  packageChecksum: string;
  currentStatus: CurriculumStatus;
  correlationId: string;
  entries: LifecycleAuditEntry[];
}
