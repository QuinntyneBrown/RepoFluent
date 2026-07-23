export interface ContractCompatibility {
  supportedVersionWindow: string;
  semanticVersion: Record<string, string>;
  backwardCompatibilityStatus: string;
  backwardCompatibilityPolicy: string;
  forwardCompatibilityStatus: string;
  forwardCompatibilityPolicy: string;
  deprecationNoticeDays: number;
  unsupportedIssueCode: string;
  unsupportedMajorBehavior: string;
  unsupportedMinorBehavior: string;
  migrationResponsibility: string;
  migrationPreserves: string[];
  migrationLossBehavior: string;
  migrationPolicy: string;
}
