using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RepoFluent.Application;

namespace RepoFluent.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddRepoFluentInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("RepoFluent")
            ?? "Data Source=repofluent.db";
        services.AddDbContext<RepoFluentDbContext>(options => options.UseSqlite(connectionString));
        services.AddScoped<ICurriculumStore, CurriculumStore>();
        services.AddSingleton<IUserDirectory, DevelopmentUserDirectory>();
        return services;
    }
}
