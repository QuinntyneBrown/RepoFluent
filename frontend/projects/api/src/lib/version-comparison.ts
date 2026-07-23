import type { VersionChange } from './version-change';

export interface VersionComparison {
  baseVersionId: string;
  targetVersionId: string;
  packageId: string;
  baseVersion: string;
  targetVersion: string;
  changes: VersionChange[];
  affectedObjectiveIds: string[];
  learnerRefreshRequired: boolean;
}
