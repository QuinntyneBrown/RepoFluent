import type { ArchitectureRelationship } from './architecture-relationship';
import type { Assessment } from './assessment';
import type { ContractExtension } from './contract-extension';
import type { Course } from './course';
import type { CurriculumSystem } from './curriculum-system';
import type { EvidenceMetadata } from './evidence-metadata';
import type { SourceSnapshot } from './source-snapshot';
import type { TerminologyDefinition } from './terminology-definition';

export interface CurriculumPackage {
  contractVersion: string;
  packageId: string;
  version: string;
  title: string;
  description: string;
  owner: string;
  locale: string;
  createdAt: string;
  createdBy: string;
  evidence?: EvidenceMetadata;
  extensions?: ContractExtension[];
  sourceSnapshot: SourceSnapshot;
  systems: CurriculumSystem[];
  relationships: ArchitectureRelationship[];
  terminology: TerminologyDefinition[];
  courses: Course[];
  assessments: Assessment[];
}
