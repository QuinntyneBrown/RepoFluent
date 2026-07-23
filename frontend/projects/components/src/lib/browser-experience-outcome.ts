export interface BrowserExperienceOutcome {
  kind: 'browser-capability' | 'critical-error';
  outcome: 'supported' | 'unsupported' | 'recorded';
  policyId: string;
  presentation: 'full' | 'safe-fallback';
}
