import type { BrowserReleaseProfile } from './browser-release-profile';

export interface BrowserSupportPolicy {
  id: string;
  framework: string;
  baselineDate: string;
  source: string;
  releaseProfiles: readonly BrowserReleaseProfile[];
  requiredCapabilities: readonly string[];
  optionalCapabilities: readonly string[];
}
