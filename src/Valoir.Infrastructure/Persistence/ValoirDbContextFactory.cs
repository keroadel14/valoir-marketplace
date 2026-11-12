using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Valoir.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for EF Core migrations (dotnet ef migrations add ...).
/// </summary>
public class ValoirDbContextFactory : IDesignTimeDbContextFactory<ValoirDbContext>
{
    public ValoirDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ValoirDbContext>();
        var cs = Environment.GetEnvironmentVariable("VALOIR_CONNECTION")
            ?? "Host=localhost;Database=valoir;Username=valoir;Password=valoir";
        optionsBuilder.UseNpgsql(cs);
        return new ValoirDbContext(optionsBuilder.Options);
    }
}
