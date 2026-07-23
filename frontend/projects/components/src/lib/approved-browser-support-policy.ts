import type { BrowserSupportPolicy } from './browser-support-policy';

export const approvedBrowserSupportPolicy: BrowserSupportPolicy = Object.freeze({
  id: 'angular-21-baseline-2025-10-20',
  framework: 'Angular 21 widely available Baseline',
  baselineDate: '20 October 2025',
  source: 'https://angular.dev/reference/versions#browser-support',
  releaseProfiles: [
    {
      family: 'Chrome and Edge',
      productionPolicy: 'Angular 21 Baseline',
      ciEngine: 'Chromium 149.0.7827.x · Playwright 1.61.1',
    },
    {
      family: 'Firefox',
      productionPolicy: 'Angular 21 Baseline',
      ciEngine: 'Firefox 151.0',
    },
    {
      family: 'Safari and iOS',
      productionPolicy: 'Angular 21 Baseline',
      ciEngine: 'WebKit 26.5',
    },
  ],
  requiredCapabilities: [
    'Native dialog',
    'CSS Grid',
    'Custom events',
    'Abort controller',
    'Animation frames',
  ],
  optionalCapabilities: ['WebGPU · Optional · semantic fallback required'],
});
