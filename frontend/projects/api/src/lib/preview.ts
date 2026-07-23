import type { CurriculumPackage } from './curriculum-package';

export interface Preview {
  importId: string;
  isDraft: boolean;
  package: CurriculumPackage;
}
