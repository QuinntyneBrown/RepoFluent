export interface LifecycleAuditEntry {
  id: number;
  action: string;
  actorId: string;
  occurredAt: string;
  correlationId: string;
  packageChecksum: string | null;
  packageVersion: string | null;
  lifecycleStatus: string | null;
}
