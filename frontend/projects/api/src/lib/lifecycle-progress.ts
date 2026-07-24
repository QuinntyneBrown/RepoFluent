export interface LifecycleProgress {
  activeStage: string;
  completedStages: string[];
  createdAt: string;
  processingStartedAt: string | null;
  validationCompletedAt: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  retiredAt: string | null;
  isStale: boolean;
  isActionRequired: boolean;
  failureCode: string | null;
  failureDetail: string | null;
}
