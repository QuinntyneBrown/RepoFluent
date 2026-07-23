export interface VersionChange {
  classification: string;
  entityType: string;
  entityId: string;
  description: string;
  affectedObjectiveIds: string[];
  learnerRefreshRequired: boolean;
}
