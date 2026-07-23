export interface ValidationReport {
  validatorVersion: string;
  contractVersion: string;
  packageChecksum: string;
  issueChecksum: string;
  checkCategories: string[];
  errorCount: number;
  warningCount: number;
  completedAt: string;
}
