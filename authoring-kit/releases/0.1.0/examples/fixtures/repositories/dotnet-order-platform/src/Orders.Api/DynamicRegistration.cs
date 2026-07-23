using System.Reflection;

namespace Orders.Api;

public static class DynamicRegistration
{
    public static IServiceCollection AddDynamicHandlers(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var assemblyNames = configuration.GetSection("HandlerAssemblies").Get<string[]>() ?? [];
        foreach (var assemblyName in assemblyNames)
        {
            services.Scan(scan => scan.FromAssemblies(Assembly.Load(assemblyName)));
        }

        return services;
    }
}
