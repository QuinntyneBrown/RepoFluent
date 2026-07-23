import type { AuthoringKitArtifact } from './authoring-kit-artifact';
import type { AuthoringKitOfflinePolicy } from './authoring-kit-offline-policy';

export interface AuthoringKitRelease {
  kit: string;
  kitVersion: string;
  contractVersion: string;
  validatorVersion: string;
  status: string;
  publishedAt: string;
  runtime: string;
  releaseChecksum: string;
  offline: AuthoringKitOfflinePolicy;
  artifacts: AuthoringKitArtifact[];
}
