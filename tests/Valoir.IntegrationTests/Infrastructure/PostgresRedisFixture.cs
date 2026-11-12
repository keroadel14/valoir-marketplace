using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using Testcontainers.Redis;
using Valoir.Infrastructure.Persistence;
using Xunit;

namespace Valoir.IntegrationTests.Infrastructure;

/// <summary>
/// Shared fixture: starts real PostgreSQL + Redis containers once per test collection.
/// Skips construction when Docker is unavailable (tests must check DockerAvailability).
/// </summary>
public sealed class PostgresRedisFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _pg;
    private RedisContainer? _redis;

    public string PostgresConnectionString { get; private set; } = "";
    public string RedisConnectionString { get; private set; } = "";
    public bool IsReady { get; private set; }

    public async Task InitializeAsync()
    {
        DockerAvailability.EnsureAvailableOrThrow();
        if (!DockerAvailability.IsAvailable)
        {
            IsReady = false;
            return;
        }

        _pg = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("valoir_test")
            .WithUsername("valoir")
            .WithPassword("valoir_test_pw")
            .Build();

        _redis = new RedisBuilder()
            .WithImage("redis:7-alpine")
            .Build();

        await Task.WhenAll(_pg.StartAsync(), _redis.StartAsync());

        PostgresConnectionString = _pg.GetConnectionString();
        RedisConnectionString = _redis.GetConnectionString();
        IsReady = true;
    }

    public async Task DisposeAsync()
    {
        if (_pg is not null) await _pg.DisposeAsync();
        if (_redis is not null) await _redis.DisposeAsync();
    }

    /// <summary>Creates a DbContext pointed at the test Postgres and applies all migrations.</summary>
    public async Task<ValoirDbContext> CreateMigratedContextAsync()
    {
        if (!IsReady) throw new InvalidOperationException(DockerAvailability.SkipReason);

        var options = new DbContextOptionsBuilder<ValoirDbContext>()
            .UseNpgsql(PostgresConnectionString)
            .Options;
        var db = new ValoirDbContext(options);
        await db.Database.MigrateAsync();
        return db;
    }
}

[CollectionDefinition("PostgresRedis")]
public class PostgresRedisCollection : ICollectionFixture<PostgresRedisFixture> { }
