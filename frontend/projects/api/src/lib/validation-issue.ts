export interface ValidationIssue {
  code: string;
  severity: string;
  isBlocking: boolean;
  message: string;
  path: string;
}
