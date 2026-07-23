import type { Course } from './course';
import type { SourceSnapshot } from './source-snapshot';

export interface CurriculumPackage {
  contractVersion: string;
  packageId: string;
  version: string;
  title: string;
  description: string;
  owner: string;
  locale: string;
  sourceSnapshot: SourceSnapshot;
  courses: Course[];
}
