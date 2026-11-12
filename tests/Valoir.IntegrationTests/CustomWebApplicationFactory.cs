using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Valoir.Infrastructure.Identity;
using Valoir.Infrastructure.Persistence;
using Valoir.Infrastructure.Services;

namespace Valoir.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            // Replace Postgres with InMemory for tests
            var descriptors = services.Where(d =>
                d.ServiceType == typeof(DbContextOptions<ValoirDbContext>) ||
                d.ServiceType == typeof(ValoirDbContext) ||
                (d.ServiceType.FullName?.Contains("EntityFramework") == true &&
                 d.ServiceType.FullName.Contains("DbContextOptions"))).ToList();

            // Remove existing DbContext registration
            var toRemove = services.Where(d =>
                d.ServiceType == typeof(DbContextOptions<ValoirDbContext>) ||
                d.ImplementationType == typeof(ValoirDbContext) ||
                (d.ServiceType.IsGenericType &&
                 d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))).ToList();
            foreach (var d in toRemove)
                services.Remove(d);

            services.RemoveAll(typeof(DbContextOptions<ValoirDbContext>));
            services.RemoveAll<ValoirDbContext>();

            var dbName = "ValoirTests_" + Guid.NewGuid().ToString("N");
            services.AddDbContext<ValoirDbContext>(opt => opt.UseInMemoryDatabase(dbName));
            services.AddScoped<Valoir.Application.Common.Interfaces.IValoirDbContext>(sp =>
                sp.GetRequiredService<ValoirDbContext>());

            // Disable hosted outbox during tests to avoid background noise
            var hosted = services.Where(d => d.ImplementationType == typeof(OutboxProcessor)).ToList();
            foreach (var h in hosted) services.Remove(h);
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ValoirDbContext>();
        await db.Database.EnsureCreatedAsync();
        await SuperAdminSeeder.SeedAsync(Services);
    }
}
