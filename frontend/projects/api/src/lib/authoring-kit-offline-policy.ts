export interface AuthoringKitOfflinePolicy {
  supported: boolean;
  validationRequiresNetwork: boolean;
  optionalNetworkFeaturesEnabledByDefault: boolean;
  optionalNetworkFeatures: string[];
}
