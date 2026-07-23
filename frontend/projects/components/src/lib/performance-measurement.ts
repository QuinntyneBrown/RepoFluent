export interface PerformanceMeasurement {
  name: string;
  kind: 'shell' | 'interaction';
  durationMs: number;
  budgetMs: number;
  outcome: 'within-budget' | 'budget-breach';
  profileId: string;
}
