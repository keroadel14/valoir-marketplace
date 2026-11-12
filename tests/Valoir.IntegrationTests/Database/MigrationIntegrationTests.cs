using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Valoir.Domain.Entities;
using Valoir.IntegrationTests.Infrastructure;
using Xunit;

namespace Valoir.IntegrationTests.Database;

[Collection("PostgresRedis")]
public class MigrationIntegrationTests
{
    private readonly PostgresRedisFixture _fx;

    public MigrationIntegrationTests(PostgresRedisFixture fx) => _fx = fx;

    private static async Task<List<string>> QueryStringsAsync(string cs, string sql)
    {
        var list = new List<string>();
        await using var conn = new NpgsqlConnection(cs);
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            list.Add(reader.GetString(0));
        return list;
    }

    [Fact]
    public async Task FreshDatabase_AppliesAllMigrations_IncludingProcessedStripeAndOutboxLease()
    {
        if (!_fx.IsReady) return;

        await using var db = await _fx.CreateMigratedContextAsync();

        var history = await QueryStringsAsync(_fx.PostgresConnectionString,
            """SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY "MigrationId" """);

        history.Should().Contain(id => id.Contains("InitialCreate"));
        history.Should().Contain(id => id.Contains("AddProcessedStripeEvent"));
        history.Should().Contain(id => id.Contains("AddOutboxProcessingLease"));

        var tables = await QueryStringsAsync(_fx.PostgresConnectionString,
            """SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1""");

        tables.Should().Contain("ProcessedStripeEvents");
        tables.Should().Contain("OutboxMessages");
        tables.Should().Contain("Orders");
        tables.Should().Contain("VendorLedgerEntries");

        var indexes = await QueryStringsAsync(_fx.PostgresConnectionString,
            """SELECT indexname FROM pg_indexes WHERE tablename = 'ProcessedStripeEvents'""");
        indexes.Should().Contain(i => i.Contains("EventId", StringComparison.OrdinalIgnoreCase));

        var cols = await QueryStringsAsync(_fx.PostgresConnectionString,
            """SELECT column_name FROM information_schema.columns WHERE table_name = 'OutboxMessages'""");
        cols.Should().Contain(c => c.Equals("ProcessingStartedAt", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task ProcessedStripeEvent_EventId_IsUnique()
    {
        if (!_fx.IsReady) return;

        await using var db = await _fx.CreateMigratedContextAsync();
        db.ProcessedStripeEvents.Add(ProcessedStripeEvent.Create("evt_unique_1", "payment_intent.succeeded"));
        await db.SaveChangesAsync();
        db.ProcessedStripeEvents.Add(ProcessedStripeEvent.Create("evt_unique_1", "payment_intent.succeeded"));
        var act = async () => await db.SaveChangesAsync();
        await act.Should().ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task TransactionRollback_LeavesNoPartialData()
    {
        if (!_fx.IsReady) return;

        await using var db = await _fx.CreateMigratedContextAsync();
        await using var tx = await db.Database.BeginTransactionAsync();
        db.OutboxMessages.Add(OutboxMessage.Create("signalr.notify", "{}", "rollback-test-key"));
        await db.SaveChangesAsync();
        await tx.RollbackAsync();

        // New context to avoid tracking
        await using var db2 = await _fx.CreateMigratedContextAsync();
        var count = await db2.OutboxMessages.CountAsync(m => m.IdempotencyKey == "rollback-test-key");
        count.Should().Be(0);
    }

    [Fact]
    public async Task OutboxIdempotencyKey_IsUnique_WhenNotNull()
    {
        if (!_fx.IsReady) return;

        await using var db = await _fx.CreateMigratedContextAsync();
        db.OutboxMessages.Add(OutboxMessage.Create("stripe.refund", "{}", "idem-1"));
        await db.SaveChangesAsync();
        db.OutboxMessages.Add(OutboxMessage.Create("stripe.refund", "{}", "idem-1"));
        var act = async () => await db.SaveChangesAsync();
        await act.Should().ThrowAsync<DbUpdateException>();
    }
}
