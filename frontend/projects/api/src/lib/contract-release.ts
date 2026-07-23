import type { ContractArtifact } from './contract-artifact';
import type { ContractCompatibility } from './contract-compatibility';
import type { ContractFixtureSummary } from './contract-fixture-summary';

export interface ContractRelease {
  contract: string;
  version: string;
  status: string;
  publishedAt: string;
  checksumAlgorithm: string;
  releaseChecksum: string;
  artifacts: ContractArtifact[];
  compatibility: ContractCompatibility;
  fixtureSummary: ContractFixtureSummary;
}
