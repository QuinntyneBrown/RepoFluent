namespace RepoFluent.Api;

public sealed record AuthoringKitOfflinePolicyView(
    bool Supported,
    bool ValidationRequiresNetwork,
    bool OptionalNetworkFeaturesEnabledByDefault,
    IReadOnlyList<string> OptionalNetworkFeatures);
