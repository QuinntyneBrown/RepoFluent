import type { CurriculumStatus } from './curriculum-status';

export interface ImportReceipt {
  id: string;
  checksum: string;
  status: CurriculumStatus;
  correlationId: string;
  statusUrl: string;
}
