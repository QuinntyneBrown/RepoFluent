import type { CurriculumSubsystem } from './curriculum-subsystem';

export interface CurriculumSystem {
  id: string;
  name: string;
  responsibility: string;
  boundary: string;
  subsystems: CurriculumSubsystem[];
}
