export interface PerformanceMeasurementProfile {
  id: string;
  device: string;
  browser: string;
  connection: string;
  cache: string;
  contentEnvelope: string;
  usabilityMilestone: string;
  shellBudgetMs: number;
  interactionBudgetMs: number;
  animationFramesPerSecond: number;
}
