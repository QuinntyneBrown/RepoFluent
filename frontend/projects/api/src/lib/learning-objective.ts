import type { EvidenceMetadata } from './evidence-metadata';

export interface LearningObjective {
  id: string;
  statement: string;
  evidence?: EvidenceMetadata;
}
