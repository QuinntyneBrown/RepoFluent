import type { PerformanceMeasurementProfile } from './performance-measurement-profile';

export const approvedPerformanceProfile: PerformanceMeasurementProfile = Object.freeze({
  id: 'experience-production-v1',
  device: 'Desktop · 4 logical cores · 8 GB memory',
  browser: 'Chromium stable',
  connection: 'Pilot broadband · 10 Mbps down · 5 Mbps up · 40 ms RTT',
  cache: 'Cold shell / warm interaction',
  contentEnvelope: '33 lesson blocks · 7 system nodes',
  usabilityMilestone: 'Primary heading visible and navigation operable',
  shellBudgetMs: 2500,
  interactionBudgetMs: 200,
  animationFramesPerSecond: 60,
});
