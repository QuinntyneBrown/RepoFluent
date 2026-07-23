export interface WarningAcknowledgement {
  actorId: string;
  acknowledgedAt: string;
  packageChecksum: string;
  issueChecksum: string;
  rationale: string | null;
}
