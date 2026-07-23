import type { CurriculumPackage } from './curriculum-package';
import type { ValidationReport } from './validation-report';

export interface Preview {
  importId: string;
  isDraft: boolean;
  packageChecksum: string;
  validationReport: ValidationReport;
  package: CurriculumPackage;
}
