using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Valoir.Domain.Entities;
using Valoir.Infrastructure.Persistence;
using Valoir.IntegrationTests.Infrastructure;
using Xunit;

namespace Valoir.IntegrationTests.Outbox;

[Collection("PostgresRedis")]
public class OutboxConcurrencyTests
{
    private readonly PostgresRedisFixture _fx;

    public OutboxConcurrencyTests(PostgresRedisFixture fx) => _fx = fx;

    private ValoirDbContext NewContext()
    {
        var options = new DbContextOptionsBuilder<ValoirDbContext>()
            .UseNpgsql(_fx.PostgresConnectionString)
            .Options;
        return new ValoirDbContext(options);
    }

    [Fact]
    public async Task ConcurrentClaim_SkipLocked_DoesNotDoubleClaim()
    {
        if (!_fx.IsReady) return;

        await using (var seed = NewContext())
        {
            await seed.Database.MigrateAsync();
            for (int i = 0; i < 10; i++)
                seed.OutboxMessages.Add(OutboxMessage.Create("signalr.notify", $"{{\"i\":{i}}}", $"claim-{i}"));
            await seed.SaveChangesAsync();
        }

        async Task<List<Guid>> ClaimBatchAsync()
        {
            await using var db = NewContext();
            await using var tx = await db.Database.BeginTransactionAsync();
            var now = DateTime.UtcNow;
            var staleBefore = now - OutboxMessage.ProcessingLease;
            var claimed = await db.OutboxMessages
                .FromSqlRaw(
                    """
                    SELECT "Id", "CreatedAt", "UpdatedAt", "RowVersion",
                           "Type", "PayloadJson", "IdempotencyKey", "Status",
                           "AttemptCount", "ProcessedAt", "LastError", "NextAttemptAt",
                           "ProcessingStartedAt"
                    FROM "OutboxMessages"
                    WHERE (
                            ("Status" = {0} AND ("NextAttemptAt" IS NULL OR "NextAttemptAt" <= {1}))
                         OR ("Status" = {2} AND "ProcessingStartedAt" IS NOT NULL AND "ProcessingStartedAt" <= {3})
                          )
                    ORDER BY "CreatedAt"
                    LIMIT {4}
                    FOR UPDATE SKIP LOCKED
                    """,
                    (int)OutboxStatus.Pending, now,
                    (int)OutboxStatus.Processing, staleBefore, 5)
                .ToListAsync();

            foreach (var m in claimed)
                m.MarkProcessing();
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return claimed.Select(c => c.Id).ToList();
        }

        var t1 = ClaimBatchAsync();
        var t2 = ClaimBatchAsync();
        await Task.WhenAll(t1, t2);

        var a = await t1;
        var b = await t2;
        a.Intersect(b).Should().BeEmpty("SKIP LOCKED must prevent double claim");
        (a.Count + b.Count).Should().BeLessThanOrEqualTo(10);
        (a.Count + b.Count).Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task StaleProcessing_CanBeReclaimed()
    {
        if (!_fx.IsReady) return;

        Guid id;
        await using (var db = NewContext())
        {
            await db.Database.MigrateAsync();
            var msg = OutboxMessage.Create("signalr.notify", "{}", "stale-1");
            msg.MarkProcessing();
            // Force lease to look expired by reflecting into private setter is not available;
            // update column directly after save.
            db.OutboxMessages.Add(msg);
            await db.SaveChangesAsync();
            id = msg.Id;

            await db.Database.ExecuteSqlRawAsync(
                """UPDATE "OutboxMessages" SET "ProcessingStartedAt" = {0} WHERE "Id" = {1}""",
                DateTime.UtcNow.AddMinutes(-10), id);
        }

        await using (var db = NewContext())
        {
            var now = DateTime.UtcNow;
            var staleBefore = now - OutboxMessage.ProcessingLease;
            await using var tx = await db.Database.BeginTransactionAsync();
            var claimed = await db.OutboxMessages
                .FromSqlRaw(
                    """
                    SELECT "Id", "CreatedAt", "UpdatedAt", "RowVersion",
                           "Type", "PayloadJson", "IdempotencyKey", "Status",
                           "AttemptCount", "ProcessedAt", "LastError", "NextAttemptAt",
                           "ProcessingStartedAt"
                    FROM "OutboxMessages"
                    WHERE (
                            ("Status" = {0} AND ("NextAttemptAt" IS NULL OR "NextAttemptAt" <= {1}))
                         OR ("Status" = {2} AND "ProcessingStartedAt" IS NOT NULL AND "ProcessingStartedAt" <= {3})
                          )
                    ORDER BY "CreatedAt"
                    LIMIT {4}
                    FOR UPDATE SKIP LOCKED
                    """,
                    (int)OutboxStatus.Pending, now,
                    (int)OutboxStatus.Processing, staleBefore, 20)
                .ToListAsync();

            claimed.Select(c => c.Id).Should().Contain(id);
            foreach (var m in claimed) m.MarkProcessing();
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
    }

    [Fact]
    public async Task MarkFailed_EightTimes_GoesDeadLetter()
    {
        // Domain behavior – does not need Docker
        var msg = OutboxMessage.Create("stripe.refund", "{}", "dl-1");
        for (int i = 0; i < 8; i++)
        {
            msg.MarkProcessing();
            msg.MarkFailed("boom");
        }
        msg.Status.Should().Be(OutboxStatus.DeadLetter);
        msg.AttemptCount.Should().Be(8);
    }
}
